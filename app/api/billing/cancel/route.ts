import {database,userFor,square,squareEnvironment} from '@/lib/billing/server';
import {stopRenewal} from '@/lib/billing/cancellation';
export async function POST(request:Request){
 try{
  const user=await userFor(request);if(!user)return Response.json({error:'Sign in first.'},{status:401});
  const db=database();
  const {data:e,error}=await db.from('paid_enrollments').select('id,square_environment').eq('user_id',user.id).maybeSingle();
  if(error)throw error;
  if(!e)return Response.json({error:'Enrollment not found.'},{status:404});
  if(e.square_environment!==squareEnvironment())return Response.json({error:'Contact support to cancel this enrollment.'},{status:409});
  const now=new Date().toISOString();
  const created=await db.from('enrollment_billing').upsert({enrollment_id:e.id,cancellation_requested_at:now},{onConflict:'enrollment_id',ignoreDuplicates:true});
  if(created.error)throw created.error;
  const recorded=await db.from('enrollment_billing').update({cancellation_requested_at:now}).eq('enrollment_id',e.id).is('cancellation_requested_at',null);
  if(recorded.error)throw recorded.error;
  const {data:b,error:readError}=await db.from('enrollment_billing').select('*').eq('enrollment_id',e.id).single();
  if(readError)throw readError;
  if(b.square_subscription_id && !b.cancellation_confirmed_at){
   const stopped=await stopRenewal(square(),b.square_subscription_id);
   const saved=await db.from('enrollment_billing').update({cancellation_confirmed_at:now,square_subscription_status:stopped.status,updated_at:now}).eq('enrollment_id',e.id);
   if(saved.error)throw saved.error;
  }
  // A prepared provider request can still be in flight. Activation rechecks this marker.
  return Response.json({success:true,renewalCanceled:true,paidThrough:b.paid_through,pendingConfirmation:!!b.live_date && !b.square_subscription_id});
 }catch{return Response.json({error:'Cancellation confirmation is unavailable. Retry or email michael@hometownperksusa.com; a recorded request blocks a new activation.'},{status:503});}
}
