import {createHash} from 'node:crypto';
import {database,userFor,square,squareEnvironment} from '@/lib/billing/server';
import {recurringEnabled,RECURRING_CONSENT_TEXT,RECURRING_CONSENT_VERSION} from '@/lib/billing/recurring';
export async function POST(request:Request){
 try{
  if(!recurringEnabled())return Response.json({error:'Monthly billing setup is not open yet.'},{status:403});
  const user=await userFor(request);if(!user)return Response.json({error:'Sign in first.'},{status:401});
  const body=await request.json();
  if(body.accept!==true || body.consentVersion!==RECURRING_CONSENT_VERSION || typeof body.sourceId!=='string' || body.sourceId.length>500)return Response.json({error:'Accept the current autopay terms and provide a payment method.'},{status:400});
  const db=database(),client=square();
  const {data:e,error}=await db.from('paid_enrollments').select('id,merchant_id,status,square_environment').eq('user_id',user.id).maybeSingle();
  if(error)throw error;
  if(!e || e.status!=='paid_pending_launch' || e.square_environment!==squareEnvironment())return Response.json({error:'A verified prepaid enrollment awaiting launch is required.'},{status:409});
  const {data:old,error:readError}=await db.from('enrollment_billing').select('*').eq('enrollment_id',e.id).maybeSingle();
  if(readError)throw readError;
  if(old?.cancellation_requested_at)return Response.json({error:'Your renewal was canceled. Contact support before setting it up again.'},{status:409});
  if(old?.square_card_id)return Response.json({success:true,lastFour:old.card_last_four});
  const merchant=await db.from('merchants').select('business_name,contact_name').eq('id',e.merchant_id).single();if(merchant.error)throw merchant.error;
  const customer=await client.customers.create({idempotencyKey:`customer-${e.id}`,emailAddress:user.email,givenName:merchant.data.contact_name,companyName:merchant.data.business_name,referenceId:e.id});
  if(!customer.customer?.id)throw new Error();
  const card=await client.cards.create({idempotencyKey:createHash('sha256').update(e.id+body.sourceId).digest('hex').slice(0,40),sourceId:body.sourceId,card:{customerId:customer.customer.id}});
  if(!card.card?.id || card.card.customerId!==customer.customer.id)throw new Error();
  const {error:saveError}=await db.from('enrollment_billing').upsert({enrollment_id:e.id,square_customer_id:customer.customer.id,square_card_id:card.card.id,card_last_four:card.card.last4,card_brand:card.card.cardBrand,consent_version:RECURRING_CONSENT_VERSION,consent_text:RECURRING_CONSENT_TEXT,consent_at:new Date().toISOString()},{onConflict:'enrollment_id',ignoreDuplicates:true});
  if(saveError)throw saveError;
  return Response.json({success:true,lastFour:card.card.last4});
 }catch{return Response.json({error:'Unable to save the payment method. No renewal charge was made.'},{status:503});}
}
