import {adminFor,database} from '@/lib/billing/server';
export async function POST(request:Request){
 try{
  if(!await adminFor(request))return Response.json({error:'Owner access required.'},{status:403});
  const b=await request.json();
  if(typeof b.id!=='string' || !/^[0-9a-f-]{36}$/i.test(b.id) || typeof b.legalName!=='string' || !b.legalName.trim() || b.legalName.length>200 || typeof b.address!=='string' || !b.address.trim() || b.address.length>500 || typeof b.signedPath!=='string' || !b.signedPath.startsWith(b.id+'/') || b.signedPath.includes('..') || b.confirmSigned!==true)return Response.json({error:'Provide the host legal name, address and signed agreement.'},{status:400});
  const db=database();
  const info=await db.storage.from('host-agreements').info(b.signedPath);
  if(info.error)return Response.json({error:'Upload the signed agreement first.'},{status:400});
  const now=new Date().toISOString();
  const {data,error}=await db.from('screen_hosts').update({legal_name:b.legalName.trim(),address:b.address.trim(),signed_agreement_path:b.signedPath,signed_at:now,installed_at:b.confirmInstalled===true?now:null,active:b.confirmInstalled===true}).eq('id',b.id).select('id').maybeSingle();
  if(error)throw error;
  if(!data)return Response.json({error:'Host not found.'},{status:404});
  return Response.json({success:true});
 }catch{return Response.json({error:'Unable to save host agreement.'},{status:503});}
}
