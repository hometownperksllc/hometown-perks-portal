import {recurringEnabled} from '@/lib/billing/recurring';
import {adminFor,database} from '@/lib/billing/server';
export async function GET(request:Request){
 try{
  if(!await adminFor(request)) return Response.json({error:'Owner access required.'},{status:403});
  const db=database();
  const [merchants,enrollments,config,hosts,ads,billing]=await Promise.all([
   db.from('merchants').select('id,business_name,contact_name,email,phone,onboarding_status').order('created_at',{ascending:false}),
   db.from('paid_enrollments').select('id,user_id,merchant_id,status,amount_cents,launch_started_at,launch_deadline,square_environment'),
   db.from('enrollment_settings').select('enabled').single(),
   db.from('screen_hosts').select('id,display_name,legal_name,address,signed_at,installed_at,active').order('display_name'),
   db.from('ad_requests').select('id,user_id,promotion_title,status,merchant_approval_status'),
   db.from('enrollment_billing').select('enrollment_id,card_last_four,consent_at,cancellation_requested_at,renewal_start_date'),
  ]);
  if(merchants.error || enrollments.error || config.error || hosts.error || ads.error || billing.error) throw new Error();
  return Response.json({merchants:merchants.data,enrollments:enrollments.data,hosts:hosts.data,ads:ads.data,billing:billing.data,recurringEnabled:recurringEnabled(),enrollmentOpen:process.env.PAID_ENROLLMENT_ENABLED==='true' && config.data.enabled});
 }catch{return Response.json({error:'Unable to load merchant management.'},{status:503});}
}
