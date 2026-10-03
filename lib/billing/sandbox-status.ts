import type {SquareClient} from 'square';

export async function readSandboxStatus(client:SquareClient,ids:{paymentId?:string|null;subscriptionId?:string|null},locationId:string){
 const result:{payment_status?:string;refund_status?:string;subscription_status?:string;card_removed?:boolean;cancellation_scheduled?:boolean;cancellation_date?:string|null;provider_checked_at?:string}={};
 if(ids.paymentId){
  const {payment}=await client.payments.get({paymentId:ids.paymentId});
  if(!payment || payment.locationId!==locationId || payment.amountMoney?.amount!==BigInt(14900) || payment.amountMoney.currency!=='USD')throw Error('Sandbox payment mismatch');
  result.payment_status=payment.status;
  const refunds=await Promise.all((payment.refundIds??[]).slice(0,10).map(refundId=>client.refunds.get({refundId})));
  const refund=refunds.map(r=>r.refund).find(r=>!!r && r.paymentId===ids.paymentId && r.locationId===locationId && r.amountMoney.amount===BigInt(14900) && r.amountMoney.currency==='USD');
  if(refund?.status)result.refund_status=refund.status;
 }
 if(ids.subscriptionId){
  const {subscription}=await client.subscriptions.get({subscriptionId:ids.subscriptionId,include:'actions'});
  if(!subscription || subscription.locationId!==locationId)throw Error('Sandbox subscription mismatch');
  result.subscription_status=subscription.status;
  result.card_removed=!subscription.cardId;
  result.cancellation_date=subscription.canceledDate;
  result.cancellation_scheduled=!!subscription.canceledDate || !!subscription.actions?.some(a=>a.type==='CANCEL') || ['CANCELED','COMPLETED'].includes(subscription.status??'');
 }
 result.provider_checked_at=new Date().toISOString();
 return result;
}
