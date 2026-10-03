import {database,userFor,squareEnvironment} from '@/lib/billing/server';
import {recurringEnabled,RECURRING_CONSENT_TEXT,RECURRING_CONSENT_VERSION} from '@/lib/billing/recurring';
export async function GET(request:Request){
 try{
  const user=await userFor(request);if(!user)return Response.json({error:'Sign in first.'},{status:401});
  const {data:enrollment,error}=await database().from('paid_enrollments').select('id,status,square_environment,launch_started_at').eq('user_id',user.id).maybeSingle();
  if(error)throw error;
  if(!enrollment)return Response.json({enabled:false,enrollment:null});
  const {data:billing,error:billingError}=await database().from('enrollment_billing').select('card_last_four,card_brand,consent_at,live_date,renewal_start_date,square_subscription_status,cancellation_requested_at,cancellation_confirmed_at,paid_through').eq('enrollment_id',enrollment.id).maybeSingle();
  if(billingError)throw billingError;
  const enabled=recurringEnabled() && enrollment.square_environment===squareEnvironment();
  return Response.json({enabled,enrollment,billing,consentVersion:RECURRING_CONSENT_VERSION,consentText:RECURRING_CONSENT_TEXT,applicationId:enabled?(process.env.SQUARE_APPLICATION_ID??process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID??process.env.NEXT_PUBLIC_SQUARE_APP_ID):undefined,locationId:enabled?process.env.SQUARE_LOCATION_ID:undefined,environment:enabled?squareEnvironment():undefined});
 }catch{return Response.json({error:'Billing details unavailable.'},{status:503});}
}
