import { database } from '@/lib/billing/server';
export async function POST(request: Request) {
 try {
  const body = await request.json();
  if (typeof body.slug !== 'string' || body.slug.length > 150 || !['website','facebook','instagram','google_review','phone'].includes(body.linkType))
   return Response.json({error:'Invalid event.'},{status:400});
  const db = database();
  const {data: plate,error} = await db.from('connect_plate_setups').select('id,user_id,slug').eq('slug',body.slug).maybeSingle();
  if(error) throw error;
  if(!plate) return Response.json({error:'Not found.'},{status:404});
  const result=await db.from('connect_plate_link_clicks').insert({plate_id:plate.id,user_id:plate.user_id,slug:plate.slug,link_type:body.linkType});
  if(result.error) throw result.error;
  return Response.json({success:true});
 }catch{return Response.json({error:'Unable to record event.'},{status:503});}
}
