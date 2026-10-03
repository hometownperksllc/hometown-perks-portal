import { createHmac, timingSafeEqual } from 'node:crypto';
export function verifySignature(body:string, signature:string|null, key:string, url:string) {
 if(!signature) return false;
 const expected=createHmac('sha256',key).update(url+body).digest();
 const received=Buffer.from(signature,'base64');
 return expected.length===received.length && timingSafeEqual(expected,received);
}
