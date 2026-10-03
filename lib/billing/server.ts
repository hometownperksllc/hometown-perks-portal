import { createClient } from '@supabase/supabase-js';
import { SquareClient, SquareEnvironment } from 'square';
export function database() {
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url || !key) throw new Error('Billing database is not configured');
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
export function squareEnvironment() {
 const mode=process.env.SQUARE_ENVIRONMENT;
 if(mode!=='sandbox' && mode!=='production') throw new Error('Square environment must be explicit');
 return mode;
}
export function square() {
 const mode=squareEnvironment(), token=process.env.SQUARE_ACCESS_TOKEN;
 if(!token || !process.env.SQUARE_LOCATION_ID || !process.env.SQUARE_WEBHOOK_SIGNATURE_KEY) throw new Error('Square checkout is not configured');
 return new SquareClient({token,environment:mode==='production'?SquareEnvironment.Production:SquareEnvironment.Sandbox});
}
export async function userFor(request:Request) {
 const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
 if(!token) return null;
 const {data,error}=await database().auth.getUser(token);
 return error || !data.user?.email_confirmed_at ? null : data.user;
}
export async function settings() {
 const {data,error}=await database().from('enrollment_settings').select('*').eq('id',true).single();
 if(error) throw error;
 return data;
}
export function launchReady(config:{enabled:boolean;terms_version?:string;terms_text?:string;launch_deadline?:string;confirmed_locations?:string[]}) {
 return process.env.PAID_ENROLLMENT_ENABLED==='true' && config.enabled && !!config.terms_version && !!config.terms_text && !!config.launch_deadline && config.launch_deadline >= new Date().toISOString().slice(0,10) && !!config.confirmed_locations?.length;
}
export function billingOrigin() {
 const origin=process.env.PORTAL_ORIGIN;
 if(!origin || !/^https:\/\//.test(origin)) throw new Error('Portal origin is not configured');
 return new URL(origin).origin;
}

export async function adminFor(request:Request) {
 const user=await userFor(request);
 if(!user) return null;
 const {data,error}=await database().from('portal_admin_users').select('user_id').eq('user_id',user.id).maybeSingle();
 return error || !data ? null : user;
}
