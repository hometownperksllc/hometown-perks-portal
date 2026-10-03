import {createClient} from '@supabase/supabase-js';
import {launchReady,settings,billingOrigin} from '@/lib/billing/server';
export async function POST(request:Request) {
 try {
 if(process.env.PAID_ENROLLMENT_ENABLED!=='true') return Response.json({error:'Paid enrollment is not open yet.'},{status:403});
 if(!launchReady(await settings())) return Response.json({error:'Paid enrollment is not open yet.'},{status:403});
 const {email,password}=await request.json();
 if(typeof email!=='string' || email.length>254 || typeof password!=='string' || password.length<12 || password.length>128) return Response.json({error:'Enter a valid email and a password of at least 12 characters.'},{status:400});
 const auth=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{auth:{persistSession:false}});
 const {error}=await auth.auth.signUp({email,password,options:{emailRedirectTo:billingOrigin()+'/enroll'}});
 if(error) return Response.json({error:'Account signup could not be completed. Try signing in or resetting your password.'},{status:400});
 return Response.json({success:true,message:'Check your email to confirm your account, then sign in.'});
 } catch {return Response.json({error:'Enrollment is not available.'},{status:503});}
}
