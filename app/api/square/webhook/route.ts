import {database,square,squareEnvironment} from '@/lib/billing/server';
import {verifySignature} from '@/lib/billing/signature';
export const runtime='nodejs';
export async function POST(request:Request) {
 const key=process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,url=process.env.SQUARE_WEBHOOK_NOTIFICATION_URL;
 if(!key || !url) return Response.json({error:'Webhook is not configured.'},{status:503});
 const raw=await request.text();
 if(!verifySignature(raw,request.headers.get('x-square-hmacsha256-signature'),key,url)) return Response.json({error:'Invalid signature.'},{status:403});
 try {
 const event=JSON.parse(raw);
 if(!['payment.created','payment.updated','refund.created','refund.updated'].includes(event.type)) return Response.json({received:true});
 const id=event.data?.object?.payment?.id ?? event.data?.object?.refund?.payment_id;
 if(typeof id!=='string') return Response.json({error:'Payment id missing.'},{status:400});
 // Retrieve authoritative current state, so delayed or out-of-order webhooks cannot regress a refund.
 const {payment}=await square().payments.get({paymentId:id});
 if(!payment?.orderId || !payment.amountMoney?.amount || !payment.updatedAt) return Response.json({received:true});
 if(payment.locationId!==process.env.SQUARE_LOCATION_ID || payment.amountMoney.currency!=='USD') return Response.json({received:true});
 const {error}=await database().rpc('record_merchant_payment',{p_payment_id:id,p_order_id:payment.orderId,p_environment:squareEnvironment(),p_status:payment.status,p_amount:Number(payment.amountMoney.amount),p_refunded:Number(payment.refundedMoney?.amount??0),p_updated:payment.updatedAt});
 if(error) throw error;
 return Response.json({received:true});
 } catch {return Response.json({error:'Payment synchronization failed; retry required.'},{status:500});}
}
