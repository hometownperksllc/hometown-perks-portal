import {database,userFor} from '@/lib/billing/server';
export async function GET(request:Request) {
 try { const user=await userFor(request);
 if(!user) return Response.json({error:'Sign in first.'},{status:401});
 const {data,error}=await database().from('paid_enrollments').select('status,amount_cents,launch_deadline,confirmed_locations,launch_started_at').eq('user_id',user.id).maybeSingle();
 if(error) throw error;
 return Response.json({enrollment:data});
 } catch{return Response.json({error:'Status is unavailable.'},{status:503});}
}
