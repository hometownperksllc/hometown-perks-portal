import {userFor,adminFor,database} from '@/lib/billing/server';
import {validId} from '@/lib/documents/files';
export async function GET(request:Request){
 try{
  const user=await userFor(request);if(!user)return Response.json({error:'Sign in to view your documents.'},{status:401});
  const url=new URL(request.url),id=url.searchParams.get('id'),db=database();
  if(id){
   if(!validId(id))return Response.json({error:'Document not found.'},{status:404});
   const record=await db.from('merchant_documents').select('id,merchant_id,file_name,storage_path').eq('id',id).maybeSingle();if(record.error)throw record.error;
   if(!record.data)return Response.json({error:'Document not found.'},{status:404});
   const merchant=await db.from('merchants').select('id').eq('id',record.data.merchant_id).eq('user_id',user.id).maybeSingle();if(merchant.error)throw merchant.error;
   if(!merchant.data&&!await adminFor(request))return Response.json({error:'Document not found.'},{status:404});
   const signed=await db.storage.from('merchant-documents').createSignedUrl(record.data.storage_path,60,url.searchParams.get('download')==='1'?{download:record.data.file_name}:{});if(signed.error||!signed.data)throw Error();
   return Response.json({url:signed.data.signedUrl},{headers:{'Cache-Control':'private, no-store'}});
  }
  const result=await db.from('merchant_documents').select('id,title,file_name,file_size,created_at,merchants!inner(user_id)').eq('merchants.user_id',user.id).order('created_at',{ascending:false});if(result.error)throw result.error;
  return Response.json({documents:result.data.map(({merchants,...document})=>{void merchants;return document;})},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return Response.json({error:'Unable to load your documents.'},{status:503});}
}
