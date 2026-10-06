import {adminFor,square} from '@/lib/billing/server';
import {billingSetup} from '@/lib/billing/setup';
export const maxDuration=60;
async function handle(request:Request,prepare:boolean){
 try{
  if(!await adminFor(request))return Response.json({error:'Owner access required.'},{status:403});
  if(prepare){const body=await request.json();if(body.action!=='prepare')return Response.json({error:'Invalid setup action.'},{status:400});}
  return Response.json(await billingSetup(square(),prepare),{headers:{'Cache-Control':'no-store'}});
 }catch(error){
  const code=(error as {errors?:{code?:string}[]}).errors?.[0]?.code;
  console.error('[billing_setup] failed',{code:code&&/^[A-Z0-9_]{1,40}$/.test(code)?code:null});
  return Response.json({error:'Billing configuration could not be verified. Enrollment remains unchanged. Check the production Square application permissions and callback settings.'},{status:503});
 }
}
export function GET(request:Request){return handle(request,false);}
export function POST(request:Request){return handle(request,true);}
