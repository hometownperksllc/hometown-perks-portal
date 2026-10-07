import {database} from '@/lib/billing/server';
import {inquiryOrigins,validateInquiry} from '@/lib/inquiries';
export const runtime='nodejs';
function reply(request:Request,body:unknown,status=200){
 const origin=request.headers.get('origin')||'';
 return Response.json(body,{status,headers:{'Cache-Control':'no-store','Vary':'Origin',...(inquiryOrigins.has(origin)?{'Access-Control-Allow-Origin':origin}:{} )}});
}
export function OPTIONS(request:Request){
 const origin=request.headers.get('origin')||'';
 if(!inquiryOrigins.has(origin))return reply(request,{error:'Origin not allowed.'},403);
 return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'}});
}
export async function POST(request:Request){
 if(!inquiryOrigins.has(request.headers.get('origin')||''))return reply(request,{error:'Origin not allowed.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return reply(request,{error:'Use JSON.'},415);
 if(Number(request.headers.get('content-length'))>8192)return reply(request,{error:'Inquiry is too large.'},413);
 try{
  const reader=request.body?.getReader();if(!reader)return reply(request,{error:'Complete the inquiry form.'},400);
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>8192){await reader.cancel();return reply(request,{error:'Inquiry is too large.'},413);}chunks.push(chunk.value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  let value;try{value=JSON.parse(new TextDecoder().decode(bytes));}catch{return reply(request,{error:'Complete the inquiry form.'},400);}
  const inquiry=validateInquiry(value);if(!inquiry)return reply(request,{error:'Check your contact details and consent checkbox.'},400);
  const {data,error}=await database().rpc('save_advertiser_inquiry',{p_id:inquiry.requestId,p_business:inquiry.business,p_contact:inquiry.contact,p_email:inquiry.email,p_phone:inquiry.phone,p_area:inquiry.area,p_message:inquiry.message,p_plate:inquiry.plate});
  if(error)return reply(request,{error:'Unable to save your inquiry. Please try again or email michael@hometownperksusa.com.'},503);
  if(data==='limited')return reply(request,{error:'Too many inquiries. Please try again later or email michael@hometownperksusa.com.'},429);
  if(data!=='saved')return reply(request,{error:'Unable to save your inquiry. Please try again.'},503);
  return reply(request,{saved:true});
 }catch{return reply(request,{error:'Unable to save your inquiry. Please try again or email michael@hometownperksusa.com.'},503);}
}
