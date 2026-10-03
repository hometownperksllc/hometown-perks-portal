import {database,square,squareEnvironment} from '@/lib/billing/server';
import {stopRenewal} from '@/lib/billing/cancellation';
import {synchronizeInvoice,synchronizeSubscription} from '@/lib/billing/synchronize';
import {verifySignature} from '@/lib/billing/signature';
export const runtime='nodejs';
export async function POST(request:Request) {
 const key=process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,url=process.env.SQUARE_WEBHOOK_NOTIFICATION_URL;
 if(!key || !url) return Response.json({error:'Webhook is not configured.'},{status:503});
 const raw=await request.text();
 if(!verifySignature(raw,request.headers.get('x-square-hmacsha256-signature'),key,url)) return Response.json({error:'Invalid signature.'},{status:403});
 let stage='parse_event';
 try {
 const event=JSON.parse(raw);
 if(['subscription.created','subscription.updated'].includes(event.type)){
  const id=event.data?.object?.subscription?.id;if(typeof id!=='string')return Response.json({error:'Subscription id missing.'},{status:400});
  stage='synchronize_subscription';await synchronizeSubscription(square(),database(),id,squareEnvironment(),process.env.SQUARE_LOCATION_ID!);return Response.json({received:true});
 }
 if(['invoice.created','invoice.updated','invoice.payment_made','invoice.scheduled_charge_failed','invoice.refunded'].includes(event.type)){
  const id=event.data?.object?.invoice?.id;if(typeof id!=='string')return Response.json({error:'Invoice id missing.'},{status:400});
  stage='synchronize_invoice';await synchronizeInvoice(square(),database(),id,squareEnvironment(),process.env.SQUARE_LOCATION_ID!);return Response.json({received:true});
 }
 if(!['payment.created','payment.updated','refund.created','refund.updated'].includes(event.type)) return Response.json({received:true});
 const id=event.data?.object?.payment?.id ?? event.data?.object?.refund?.payment_id;
 if(typeof id!=='string') return Response.json({error:'Payment id missing.'},{status:400});
 // Retrieve authoritative current state, so delayed or out-of-order webhooks cannot regress a refund.
 stage='square_configuration';
 const client=square();
 stage='square_payment_lookup';
 const {payment}=await client.payments.get({paymentId:id});
 if(!payment?.orderId || !payment.amountMoney?.amount || !payment.updatedAt) return Response.json({received:true});
 if(payment.locationId!==process.env.SQUARE_LOCATION_ID || payment.amountMoney.currency!=='USD') return Response.json({received:true});
 stage='database_configuration';
 const db=database();
 stage='record_payment';
 const {error}=await db.rpc('record_merchant_payment',{p_payment_id:id,p_order_id:payment.orderId,p_environment:squareEnvironment(),p_status:payment.status,p_amount:Number(payment.amountMoney.amount),p_refunded:Number(payment.refundedMoney?.amount??0),p_updated:payment.updatedAt});
 if(error) throw error;
 if(Number(payment.refundedMoney?.amount??0)>0){
  stage='stop_refunded_enrollment_renewal';
  const enrollment=await db.from('paid_enrollments').select('id').eq('square_order_id',payment.orderId).eq('square_environment',squareEnvironment()).maybeSingle();
  if(enrollment.error)throw enrollment.error;
  if(enrollment.data){
   const b=await db.from('enrollment_billing').select('square_subscription_id').eq('enrollment_id',enrollment.data.id).maybeSingle();if(b.error)throw b.error;
   if(b.data){
    const recorded=await db.from('enrollment_billing').update({cancellation_requested_at:new Date().toISOString()}).eq('enrollment_id',enrollment.data.id);if(recorded.error)throw recorded.error;
    if(b.data.square_subscription_id){const stopped=await stopRenewal(client,b.data.square_subscription_id);const saved=await db.from('enrollment_billing').update({cancellation_confirmed_at:new Date().toISOString(),square_subscription_status:stopped.status}).eq('enrollment_id',enrollment.data.id);if(saved.error)throw saved.error;}
   }
  }
 }
 return Response.json({received:true});
 } catch(error) {
 // Log only diagnostic codes, never SDK bodies, messages, headers, or customer data.
 const details=error as {statusCode?:unknown;code?:unknown};
 console.error('[square_webhook] synchronization_failed',{
  stage,
  statusCode:typeof details?.statusCode==='number'?details.statusCode:null,
  code:typeof details?.code==='string' && /^[A-Z0-9_]{1,40}$/.test(details.code)?details.code:null,
 });
 return Response.json({error:'Payment synchronization failed; retry required.'},{status:500});
 }
}
