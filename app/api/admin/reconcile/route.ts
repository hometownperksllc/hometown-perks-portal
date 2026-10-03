import {adminFor,database,square,squareEnvironment} from '@/lib/billing/server';
import {synchronizeInvoice,synchronizeSubscription} from '@/lib/billing/synchronize';
export async function POST(request:Request){
 try{
  if(!await adminFor(request))return Response.json({error:'Owner access required.'},{status:403});
  const body=await request.json();if(typeof body.enrollmentId!=='string'|| !/^[0-9a-f-]{36}$/i.test(body.enrollmentId))return Response.json({error:'Invalid enrollment.'},{status:400});
  const db=database(),client=square(),environment=squareEnvironment(),locationId=process.env.SQUARE_LOCATION_ID!;
  const {data:e,error}=await db.from('paid_enrollments').select('id,square_environment,square_order_id').eq('id',body.enrollmentId).maybeSingle();if(error)throw error;
  if(!e||e.square_environment!==environment)return Response.json({error:'Enrollment unavailable in this environment.'},{status:409});
  if(e.square_order_id){
   const {order}=await client.orders.get({orderId:e.square_order_id});if(order?.locationId!==locationId)throw new Error();
   for(const tender of order.tenders??[]){
    if(!tender.paymentId)continue;
    const {payment:p}=await client.payments.get({paymentId:tender.paymentId});
    if(!p?.id || p.orderId!==e.square_order_id || p.locationId!==locationId || p.amountMoney?.currency!=='USD' || p.amountMoney.amount!==BigInt(14900) || !p.updatedAt)continue;
    const result=await db.rpc('record_merchant_payment',{p_payment_id:p.id,p_order_id:p.orderId,p_environment:environment,p_status:p.status,p_amount:Number(p.amountMoney.amount),p_refunded:Number(p.refundedMoney?.amount??0),p_updated:p.updatedAt});if(result.error)throw result.error;
   }
  }
  const b=await db.from('enrollment_billing').select('square_subscription_id').eq('enrollment_id',e.id).maybeSingle();if(b.error)throw b.error;
  if(b.data?.square_subscription_id){
   const id=b.data.square_subscription_id;await synchronizeSubscription(client,db,id,environment,locationId);
   const {subscription:sub}=await client.subscriptions.get({subscriptionId:id});
   for(const invoiceId of (sub?.invoiceIds??[]).slice(0,12))await synchronizeInvoice(client,db,invoiceId,environment,locationId);
  }
  return Response.json({success:true});
 }catch{return Response.json({error:'Payment reconciliation unavailable. Please retry later.'},{status:503});}
}
