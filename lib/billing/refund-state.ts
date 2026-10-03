import type {SquareClient} from 'square';
import type {SupabaseClient} from '@supabase/supabase-js';
import {stopRenewal} from './cancellation';
export async function stopRefundedEnrollment(client:SquareClient,db:SupabaseClient,orderId:string,environment:string){
 const enrollment=await db.from('paid_enrollments').select('id').eq('square_order_id',orderId).eq('square_environment',environment).maybeSingle();if(enrollment.error)throw enrollment.error;
 if(!enrollment.data)return;
 const id=enrollment.data.id,b=await db.from('enrollment_billing').select('square_subscription_id').eq('enrollment_id',id).maybeSingle();if(b.error)throw b.error;
 if(!b.data)return;
 const recorded=await db.from('enrollment_billing').update({cancellation_requested_at:new Date().toISOString()}).eq('enrollment_id',id);if(recorded.error)throw recorded.error;
 if(b.data.square_subscription_id){const stopped=await stopRenewal(client,b.data.square_subscription_id);const saved=await db.from('enrollment_billing').update({cancellation_confirmed_at:new Date().toISOString(),square_subscription_status:stopped.status}).eq('enrollment_id',id);if(saved.error)throw saved.error;}
}
