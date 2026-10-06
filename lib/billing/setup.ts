import type {SquareClient} from 'square';
import {validMonthlyPlan} from './recurring';
export const billingEvents=['payment.created','payment.updated','refund.created','refund.updated','subscription.created','subscription.updated','invoice.created','invoice.updated','invoice.payment_made','invoice.scheduled_charge_failed','invoice.refunded'];
const webhookId='wbhk_4e71f1f58dbc4837af5c1679f30a79bf';
const callback='https://portal.hometownperksusa.com/api/square/webhook';
export async function billingSetup(client:SquareClient,prepare=false){
 if(process.env.SQUARE_ENVIRONMENT!=='production'||process.env.SQUARE_WEBHOOK_NOTIFICATION_URL!==callback)throw Error('Production callback configuration does not match.');
 const existing=(await client.webhooks.subscriptions.get({subscriptionId:webhookId})).subscription;
 if(!existing||existing.notificationUrl!==callback||!existing.enabled)throw Error('The existing production webhook must be enabled and match this portal.');
 let webhook:typeof existing|undefined=existing;
 if(prepare&&!billingEvents.every(event=>existing.eventTypes?.includes(event))){
  webhook=(await client.webhooks.subscriptions.update({subscriptionId:webhookId,subscription:{eventTypes:[...new Set([...(existing.eventTypes??[]),...billingEvents])]}})).subscription;
  if(!webhook||webhook.notificationUrl!==callback||!webhook.enabled)throw Error('Webhook update could not be verified.');
 }
 let planVariationId=process.env.SQUARE_MONTHLY_PLAN_VARIATION_ID??null;
 if(!planVariationId&&prepare){
  const result=await client.catalog.object.upsert({idempotencyKey:'hometown-monthly-149-usd-v1',object:{id:'#hometown-monthly-149',type:'SUBSCRIPTION_PLAN',subscriptionPlanData:{name:'Hometown Perks Monthly Advertising 149 USD',subscriptionPlanVariations:[{id:'#hometown-monthly-149-variation',type:'SUBSCRIPTION_PLAN_VARIATION',subscriptionPlanVariationData:{name:'Monthly 149 USD',subscriptionPlanId:'#hometown-monthly-149',phases:[{cadence:'MONTHLY',pricing:{type:'STATIC',priceMoney:{amount:BigInt(14900),currency:'USD'}}}]}}]}}});
  planVariationId=result.catalogObject?.type==='SUBSCRIPTION_PLAN'?result.catalogObject.subscriptionPlanData?.subscriptionPlanVariations?.[0]?.id??null:null;
  if(!planVariationId)throw Error('Monthly plan could not be prepared.');
 }
 let planValid=false;
 if(planVariationId){
  const object=(await client.catalog.object.get({objectId:planVariationId})).object;
  planValid=object?.type==='SUBSCRIPTION_PLAN_VARIATION'&&!object.isDeleted&&validMonthlyPlan(object.subscriptionPlanVariationData?.phases);
  if(!planValid)throw Error('The monthly plan is not a fixed 149 USD monthly plan.');
 }
 return {planVariationId,planValid,planConfigured:!!process.env.SQUARE_MONTHLY_PLAN_VARIATION_ID,webhookReady:billingEvents.every(event=>webhook?.eventTypes?.includes(event)),enrollmentEnabled:process.env.PAID_ENROLLMENT_ENABLED==='true',recurringEnabled:process.env.RECURRING_BILLING_ENABLED==='true',checkedAt:new Date().toISOString()};
}
