import {database,userFor} from '@/lib/billing/server';
export async function GET(request:Request){
 try{
  const user=await userFor(request);if(!user)return Response.json({error:'Sign in to view your dashboard.'},{status:401});
  const db=database();
  const count=(table:string)=>db.from(table).select('id',{count:'exact',head:true}).eq('user_id',user.id);
  const results=await Promise.all([
   db.from('merchants').select('business_name').eq('user_id',user.id).maybeSingle(),
   db.from('paid_enrollments').select('status').eq('user_id',user.id).maybeSingle(),
   db.from('portal_admin_users').select('user_id').eq('user_id',user.id).maybeSingle(),
   count('ad_requests'),count('ad_requests').eq('status','Approved'),count('ad_requests').eq('status','Running'),
   count('connect_plate_scans'),
   ...['website','facebook','instagram','google_review','phone'].map(link=>count('connect_plate_link_clicks').eq('link_type',link)),
  ]);
  if(results.some(r=>r.error))throw Error('Overview unavailable');
  const [merchant,enrollment,owner,...counts]=results;
  return Response.json({businessName:merchant.data?.business_name??null,enrollmentStatus:enrollment.data?.status??null,isOwner:!!owner.data,counts:{requests:counts[0].count??0,approved:counts[1].count??0,running:counts[2].count??0,views:counts[3].count??0,website:counts[4].count??0,facebook:counts[5].count??0,instagram:counts[6].count??0,reviews:counts[7].count??0,phone:counts[8].count??0}},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Dashboard data could not be loaded. Please try again.'},{status:503});}
}
