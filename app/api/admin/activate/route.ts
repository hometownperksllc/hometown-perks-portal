import {adminFor,database,square,squareEnvironment} from '@/lib/billing/server';
import {stopRenewal} from '@/lib/billing/cancellation';
import {recurringEnabled,localDate,validMonthlyPlan} from '@/lib/billing/recurring';
export async function POST(request:Request){
 let createdSubscriptionId:string|null=null,provider:ReturnType<typeof square>|null=null;
 try{
  if(!recurringEnabled())return Response.json({error:'Monthly billing activation is not open yet.'},{status:403});
  if(!await adminFor(request))return Response.json({error:'Owner access required.'},{status:403});
  const body=await request.json();
  if(body.confirmAdLive!==true || typeof body.enrollmentId!=='string' || typeof body.adRequestId!=='string')return Response.json({error:'Confirm the approved ad is live at every contracted location.'},{status:400});
  const planId=process.env.SQUARE_MONTHLY_PLAN_VARIATION_ID;if(!planId)throw new Error();
  const client=square(),db=database();provider=client;
  const plan=await client.catalog.object.get({objectId:planId});
  const object=plan.object;
  if(!object || object.type!=='SUBSCRIPTION_PLAN_VARIATION' || object.isDeleted || !validMonthlyPlan(object.subscriptionPlanVariationData?.phases))throw new Error();
  const {data:b,error}=await db.rpc('prepare_recurring_activation',{p_enrollment_id:body.enrollmentId,p_environment:squareEnvironment(),p_live_date:localDate(),p_ad_request_id:body.adRequestId});
  if(error)return Response.json({error:'Activation requires verified prepayment, saved autopay consent, signed installed hosts, and approved creative.'},{status:409});
  if(b.square_subscription_id)return Response.json({success:true,firstRenewalDate:b.renewal_start_date});
  const response=await client.subscriptions.create({idempotencyKey:b.operation_id,locationId:process.env.SQUARE_LOCATION_ID!,planVariationId:planId,customerId:b.square_customer_id,cardId:b.square_card_id,startDate:b.renewal_start_date,monthlyBillingAnchorDate:Number(b.renewal_start_date.slice(8,10)),timezone:'America/New_York'});
  const sub=response.subscription;createdSubscriptionId=sub?.id??null;
  if(!sub?.id || sub.status!=='PENDING' || sub.cardId!==b.square_card_id || sub.startDate!==b.renewal_start_date || sub.customerId!==b.square_customer_id || sub.planVariationId!==planId)throw new Error();
  const saved=await db.rpc('finish_recurring_activation',{p_enrollment_id:body.enrollmentId,p_subscription_id:sub.id,p_status:sub.status??'PENDING'});
  if(saved.error)throw saved.error;
  // Cancellation can race a provider request. Re-read and honor a recorded cancellation.
  const state=await db.from('enrollment_billing').select('cancellation_requested_at').eq('enrollment_id',body.enrollmentId).single();
  if(state.error)throw state.error;
  if(state.data.cancellation_requested_at){const stopped=await stopRenewal(client,sub.id); const savedCancel=await db.from('enrollment_billing').update({cancellation_confirmed_at:new Date().toISOString(),square_subscription_status:stopped.status}).eq('enrollment_id',body.enrollmentId);if(savedCancel.error)throw savedCancel.error;}
  return Response.json({success:true,firstRenewalDate:b.renewal_start_date});
 }catch{if(createdSubscriptionId && provider){try{await stopRenewal(provider,createdSubscriptionId);}catch{console.error('[billing_activation] provider_cleanup_requires_review');}}return Response.json({error:'Activation could not be confirmed. Contact support to reconcile the same enrollment; do not create a separate subscription.'},{status:503});}
}
