import {adminFor,database} from '@/lib/billing/server';
const statuses=['Request Submitted','Info Received','In Design','Ready for Review','Changes Requested','Approved','Scheduled','Running'];
export async function POST(request:Request){
 try{
  if(!await adminFor(request)) return Response.json({error:'Owner access required.'},{status:403});
  const body=await request.json(), updates:Record<string,string>={};
  if(typeof body.id!=='string' || !/^[0-9a-f-]{36}$/i.test(body.id)) return Response.json({error:'Invalid request.'},{status:400});
  if(body.status!==undefined){if(!statuses.includes(body.status)) return Response.json({error:'Invalid status.'},{status:400});updates.status=body.status;}
  if(body.admin_notes!==undefined){if(typeof body.admin_notes!=='string' || body.admin_notes.length>5000) return Response.json({error:'Invalid notes.'},{status:400});updates.admin_notes=body.admin_notes;}
  const db=database();
  const {data:ad,error:lookupError}=await db.from('ad_requests').select('user_id').eq('id',body.id).maybeSingle();
  if(lookupError) throw lookupError;
  if(!ad) return Response.json({error:'Not found.'},{status:404});
  if(body.preview_url!==undefined){if(typeof body.preview_url!=='string' || !body.preview_url.startsWith(ad.user_id+'/') || body.preview_url.includes('..')) return Response.json({error:'Invalid preview.'},{status:400});updates.preview_url=body.preview_url;}
  if(!Object.keys(updates).length) return Response.json({error:'No changes.'},{status:400});
  const {error}=await db.from('ad_requests').update(updates).eq('id',body.id);
  if(error) throw error;
  return Response.json({success:true});
 }catch{return Response.json({error:'Unable to update ad request.'},{status:503});}
}
