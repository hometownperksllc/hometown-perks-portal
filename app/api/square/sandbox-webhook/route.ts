import {database} from '@/lib/billing/server';
import {sandboxClient} from '@/lib/billing/sandbox';
import {verifySignature} from '@/lib/billing/signature';
export async function POST(request:Request){
 const key=process.env.SQUARE_SANDBOX_WEBHOOK_SIGNATURE_KEY,url=process.env.SQUARE_SANDBOX_WEBHOOK_NOTIFICATION_URL;
 if(!key||!url)return Response.json({error:'Sandbox webhook is not configured.'},{status:503});
 const raw=await request.text();if(!verifySignature(raw,request.headers.get('x-square-hmacsha256-signature'),key,url))return Response.json({error:'Invalid signature.'},{status:403});
 try{
  const event=JSON.parse(raw);if(!['payment.created','payment.updated','refund.created','refund.updated'].includes(event.type))return Response.json({received:true});
  const id=event.data?.object?.payment?.id??event.data?.object?.refund?.payment_id;if(typeof id!=='string')return Response.json({error:'Payment id missing.'},{status:400});
  const {payment}=await sandboxClient().payments.get({paymentId:id});
  if(!payment?.orderId||payment.locationId!==process.env.SQUARE_SANDBOX_LOCATION_ID||payment.amountMoney?.currency!=='USD'||payment.amountMoney.amount!==BigInt(14900))return Response.json({received:true});
  const db=database(),{data:run,error}=await db.from('square_sandbox_runs').select('id').eq('square_order_id',payment.orderId).maybeSingle();if(error)throw error;
  if(!run)return Response.json({received:true});
  const fields=event.type.startsWith('refund.')?{webhook_refund_seen_at:new Date().toISOString()}:{webhook_payment_seen_at:new Date().toISOString()};
  const saved=await db.from('square_sandbox_runs').update(fields).eq('id',run.id);if(saved.error)throw saved.error;
  return Response.json({received:true});
 }catch{console.error('[square_sandbox_webhook] synchronization_failed');return Response.json({error:'Sandbox synchronization failed; retry required.'},{status:500});}
}
