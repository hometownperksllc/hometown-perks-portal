import {adminFor,database} from '@/lib/billing/server';
import {DOCUMENT_LIMIT,documentName,validId,validPdf} from '@/lib/documents/files';
export async function GET(request:Request){
 try{
  if(!await adminFor(request))return Response.json({error:'Owner access required.'},{status:403});
  const db=database(),merchantId=new URL(request.url).searchParams.get('merchantId');
  const {data:merchants,error}=await db.from('merchants').select('id,business_name,email,user_id').order('business_name');if(error)throw error;
  if(merchantId&&!validId(merchantId))return Response.json({error:'Invalid merchant.'},{status:400});
  const documents=merchantId?await db.from('merchant_documents').select('id,title,file_name,file_size,created_at').eq('merchant_id',merchantId).order('created_at',{ascending:false}):{data:[],error:null};if(documents.error)throw documents.error;
  return Response.json({merchants:merchants.map(m=>({id:m.id,businessName:m.business_name,email:m.email,accountLinked:!!m.user_id})),documents:documents.data},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Unable to load merchant documents.'},{status:503});}
}
export async function POST(request:Request){
 try{
  const owner=await adminFor(request);if(!owner)return Response.json({error:'Owner access required.'},{status:403});
  const length=Number(request.headers.get('content-length'));if(length>DOCUMENT_LIMIT+65536)return Response.json({error:'Choose a PDF no larger than 3 MB.'},{status:413});
  const form=await request.formData(),merchantId=form.get('merchantId'),title=form.get('title'),file=form.get('file');
  if(!validId(merchantId)||typeof title!=='string'||!title.trim()||title.trim().length>160||!(file instanceof File)||file.type!=='application/pdf'||file.size>DOCUMENT_LIMIT||!file.size)return Response.json({error:'Select a merchant, enter a title and choose a PDF no larger than 3 MB.'},{status:400});
  const db=database(),merchant=await db.from('merchants').select('id').eq('id',merchantId).maybeSingle();if(merchant.error)throw merchant.error;if(!merchant.data)return Response.json({error:'Merchant not found.'},{status:404});
  const bytes=new Uint8Array(await file.arrayBuffer());if(!validPdf(bytes))return Response.json({error:'The selected file is not a valid PDF.'},{status:400});
  const id=crypto.randomUUID(),path=`${merchantId}/${id}.pdf`,name=documentName(file.name),storage=db.storage.from('merchant-documents');
  const upload=await storage.upload(path,bytes,{contentType:'application/pdf',upsert:false});if(upload.error)throw upload.error;
  const saved=await db.from('merchant_documents').insert({id,merchant_id:merchantId,title:title.trim(),file_name:name,storage_path:path,file_size:file.size,uploaded_by:owner.id});
  if(saved.error){await storage.remove([path]);throw saved.error;}
  return Response.json({success:true,id},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Document could not be saved. Please try again.'},{status:503});}
}
