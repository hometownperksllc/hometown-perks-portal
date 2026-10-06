export const DOCUMENT_LIMIT=3*1024*1024;
export function documentName(name:string){return name.replace(/[^a-zA-Z0-9._ -]/g,'_').slice(0,175).replace(/\.pdf$/i,'')+'.pdf';}
export function validPdf(bytes:Uint8Array){return bytes.length>5&&bytes.length<=DOCUMENT_LIMIT&&Buffer.from(bytes.subarray(0,5)).toString()==='%PDF-';}
export function validId(value:unknown):value is string{return typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);}
