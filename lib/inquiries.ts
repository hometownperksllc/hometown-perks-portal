export const inquiryOrigins = new Set(['https://www.hometownperksusa.com','https://hometownperksusa.com']);
export type Inquiry = {requestId:string;business:string;contact:string;email:string;phone:string;area:string;message:string;plate:boolean};
export function validateInquiry(value:unknown):Inquiry|null {
 if(!value || typeof value!=='object')return null;
 const v=value as Record<string,unknown>;
 if(v.consent!==true || v.website || typeof v.plate!=='boolean' || typeof v.requestId!=='string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v.requestId))return null;
 const limits={business:150,contact:150,email:254,phone:40,area:200,message:1500};
 const fields:Record<string,string>={};
 for(const [key,max] of Object.entries(limits)){
  if(typeof v[key]!=='string')return null;
  const text=(v[key] as string).trim();if(text.length>max || /\u0000/.test(text))return null;fields[key]=text;
 }
 if(!fields.business || !fields.contact || !fields.area || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))return null;
 return {requestId:v.requestId,business:fields.business,contact:fields.contact,email:fields.email.toLowerCase(),phone:fields.phone,area:fields.area,message:fields.message,plate:v.plate};
}
