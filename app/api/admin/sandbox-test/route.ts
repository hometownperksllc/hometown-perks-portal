import {adminFor,database} from '@/lib/billing/server';
import {sandboxClient} from '@/lib/billing/sandbox';
import {firstRenewalDate,localDate} from '@/lib/billing/recurring';
import {stopRenewal} from '@/lib/billing/cancellation';
import {readSandboxStatus} from '@/lib/billing/sandbox-status';
export const maxDuration=60;
export async function GET(request:Request){
 try{if(!await adminFor(request))return Response.json({error:'Owner access required.'},{status:403});
 const {data,error}=await database().from('square_sandbox_runs').select('id,live_date,renewal_start_date,payment_status,refund_status,subscription_status,stage,webhook_payment_seen_at,webhook_refund_seen_at,last_error_code,square_payment_id,square_subscription_id').order('created_at',{ascending:false}).limit(10);
 if(error)throw error;
 const configured=!!process.env.SQUARE_SANDBOX_ACCESS_TOKEN&&!!process.env.SQUARE_SANDBOX_LOCATION_ID;
 const client=configured?sandboxClient():null;
 const runs=await Promise.all((data??[]).map(async row=>{
  const {square_payment_id,square_subscription_id,...saved}=row;
  if(!client)return saved;
  try{return {...saved,...await readSandboxStatus(client,{paymentId:square_payment_id,subscriptionId:square_subscription_id},process.env.SQUARE_SANDBOX_LOCATION_ID!)};}
  catch{return {...saved,provider_check_error:true};}
 }));
 return Response.json({configured,runs},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Sandbox test status unavailable.'},{status:503});}
}
export async function POST(request:Request){
 let stage='authorization',runId:string|undefined;
 try{
  const owner=await adminFor(request);if(!owner)return Response.json({error:'Owner access required.'},{status:403});
  const body=await request.json();if(typeof body.runId!=='string'|| !/^[0-9a-f-]{36}$/i.test(body.runId))return Response.json({error:'Invalid test run.'},{status:400});
  runId=body.runId;const client=sandboxClient(),db=database(),locationId=process.env.SQUARE_SANDBOX_LOCATION_ID!;
  const today=localDate();
  const created=await db.from('square_sandbox_runs').upsert({id:runId,owner_user_id:owner.id,live_date:today,renewal_start_date:firstRenewalDate(today)},{onConflict:'id',ignoreDuplicates:true});if(created.error)throw created.error;
  const {data:run,error}=await db.from('square_sandbox_runs').select('*').eq('id',runId).eq('owner_user_id',owner.id).single();if(error)throw error;
  if(run.stage==='completed')return Response.json({success:true,runId});
  async function save(fields:Record<string,unknown>){const result=await db.from('square_sandbox_runs').update({...fields,stage,updated_at:new Date().toISOString()}).eq('id',runId!);if(result.error)throw result.error;}
  stage='create_test_order';
  const order=await client.orders.create({idempotencyKey:`order-${runId}`,order:{locationId,referenceId:runId,lineItems:[{name:'Sandbox only Hometown Perks first 30 days',quantity:'1',basePriceMoney:{amount:BigInt(14900),currency:'USD'}}]}});
  if(!order.order?.id)throw new Error();await save({square_order_id:order.order.id});
  stage='create_test_payment';
  const payment=await client.payments.create({idempotencyKey:`pay-${runId}`,sourceId:'cnon:card-nonce-ok',locationId,orderId:order.order.id,amountMoney:{amount:BigInt(14900),currency:'USD'},autocomplete:true,note:'Sandbox test only'});
  if(!payment.payment?.id || payment.payment.status!=='COMPLETED' || payment.payment.amountMoney?.amount!==BigInt(14900))throw new Error();await save({square_payment_id:payment.payment.id,payment_status:payment.payment.status});
  // Replaying the exact provider request must return the same payment, never a second charge.
  const replay=await client.payments.create({idempotencyKey:`pay-${runId}`,sourceId:'cnon:card-nonce-ok',locationId,orderId:order.order.id,amountMoney:{amount:BigInt(14900),currency:'USD'},autocomplete:true,note:'Sandbox test only'});
  if(replay.payment?.id!==payment.payment.id)throw new Error('Payment replay mismatch');
  stage='store_test_card';
  const customer=await client.customers.create({idempotencyKey:`cust-${runId}`,givenName:'Sandbox Merchant',emailAddress:'merchant-test@example.com',referenceId:runId});if(!customer.customer?.id)throw new Error();
  const card=await client.cards.create({idempotencyKey:`card-${runId}`,sourceId:'cnon:card-nonce-ok',card:{customerId:customer.customer.id}});if(!card.card?.id)throw new Error();
  stage='create_test_plan';
  const plan=await client.catalog.object.upsert({idempotencyKey:`plan-${runId}`,object:{id:'#monthly-plan',type:'SUBSCRIPTION_PLAN',subscriptionPlanData:{name:'Hometown Perks Sandbox Monthly 149',subscriptionPlanVariations:[{id:'#monthly-variation',type:'SUBSCRIPTION_PLAN_VARIATION',subscriptionPlanVariationData:{name:'Monthly 149 USD',subscriptionPlanId:'#monthly-plan',phases:[{cadence:'MONTHLY',pricing:{type:'STATIC',priceMoney:{amount:BigInt(14900),currency:'USD'}}}]}}]}}});
  const variation=plan.catalogObject?.type==='SUBSCRIPTION_PLAN'?plan.catalogObject.subscriptionPlanData?.subscriptionPlanVariations?.find(v=>v.type==='SUBSCRIPTION_PLAN_VARIATION'):undefined;
  if(!variation?.id)throw new Error();
  stage='create_delayed_test_subscription';
  const subscription=await client.subscriptions.create({idempotencyKey:`sub-${runId}`,locationId,customerId:customer.customer.id,cardId:card.card.id,planVariationId:variation.id,startDate:run.renewal_start_date,monthlyBillingAnchorDate:Number(run.renewal_start_date.slice(8,10)),timezone:'America/New_York'});
  const sub=subscription.subscription;
  if(!sub?.id || sub.startDate!==run.renewal_start_date || sub.status!=='PENDING')throw new Error();await save({square_subscription_id:sub.id,subscription_status:sub.status});
  stage='cancel_test_subscription';
  const stopped=await stopRenewal(client,sub.id);await save({subscription_status:stopped.status});
  stage='refund_test_payment';
  const refund=await client.refunds.refundPayment({idempotencyKey:`refund-${runId}`,paymentId:payment.payment.id,amountMoney:{amount:BigInt(14900),currency:'USD'},reason:'Sandbox smoke test cleanup'});
  if(!refund.refund?.id)throw new Error();await save({refund_status:refund.refund.status});
  stage='completed';await save({});return Response.json({success:true,runId,firstRenewalDate:run.renewal_start_date});
 }catch(error){
  const details=error as {statusCode?:number;errors?:{code?:string}[]};const code=details.errors?.[0]?.code;
  console.error('[square_sandbox] test_failed',{stage,statusCode:details.statusCode??null,code:code&&/^[A-Z0-9_]{1,40}$/.test(code)?code:null});
  if(runId){try{await database().from('square_sandbox_runs').update({stage,last_error_code:code&&/^[A-Z0-9_]{1,40}$/.test(code)?code:'TEST_FAILED'}).eq('id',runId);}catch{}}
  return Response.json({error:'Sandbox test stopped. Review the stage and retry the same run.',stage,runId},{status:503});
 }
}
