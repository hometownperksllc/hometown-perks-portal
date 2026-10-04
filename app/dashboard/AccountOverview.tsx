'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {supabase} from '@/lib/supabase';
type Overview={businessName:string|null;enrollmentStatus:string|null;isOwner:boolean;counts:{requests:number;approved:number;running:number;views:number;website:number;facebook:number;instagram:number;reviews:number;phone:number}};
const tools=[['Submit ad request','/ad-request'],['Review ad timeline','/ad-timeline'],['Set up Connect Plate','/connect-plate'],['Edit Connect Plate','/edit-connect-plate'],['View analytics','/analytics'],['Manage billing','/billing']];
export default function AccountOverview({analytics=false}:{analytics?:boolean}){
 const [data,setData]=useState<Overview|null>(null),[message,setMessage]=useState('Loading your account…'),[attempt,setAttempt]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();let active=true;
  async function load(){try{
   const {data:{session}}=await supabase.auth.getSession();
   if(!session)throw Error('Sign in to view your account.');
   const response=await fetch('/api/merchant/overview',{headers:{Authorization:`Bearer ${session.access_token}`},cache:'no-store',signal:controller.signal});
   const result=await response.json();if(!response.ok)throw Error(result.error??'Account data unavailable.');
   if(active){setData(result);setMessage('');}
  }catch(e){if(active)setMessage(e instanceof Error?e.message:'Account data unavailable.');}}
  void load();return()=>{active=false;controller.abort();};
 },[attempt]);
 async function logout(){const {error}=await supabase.auth.signOut();if(error){setMessage('Unable to sign out. Please try again.');return;}window.location.assign('/login');}
 const stats=data?analytics?[['Connect Plate page views',data.counts.views],['Website clicks',data.counts.website],['Facebook clicks',data.counts.facebook],['Instagram clicks',data.counts.instagram],['Review link clicks',data.counts.reviews],['Phone link clicks',data.counts.phone]]:[['Ad requests',data.counts.requests],['Approved ads',data.counts.approved],['Running ads',data.counts.running],['Connect Plate page views',data.counts.views],['Website clicks',data.counts.website],['Review link clicks',data.counts.reviews]]:[];
 return <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 text-white p-6 sm:p-10"><div className="max-w-6xl mx-auto">
  <header className="flex flex-wrap justify-between items-center gap-5 mb-10"><div><p className="uppercase tracking-widest text-blue-300 text-sm mb-3">{analytics?'Merchant analytics':'Merchant dashboard'}</p><h1 className="text-4xl sm:text-6xl font-bold">Hometown Perks</h1></div>{data&&<button onClick={()=>void logout()} className="rounded-xl bg-blue-600 px-6 py-3 font-semibold">Log Out</button>}</header>
  {message&&<section role="status" className="rounded-2xl bg-slate-800 p-6 mb-6"><p>{message}</p><div className="flex gap-5 mt-4"><Link className="text-blue-300 underline" href="/login">Sign in</Link><button className="text-blue-300 underline" onClick={()=>{setMessage('Loading your account…');setAttempt(n=>n+1);}}>Retry</button></div></section>}
  {data&&<><section className="rounded-3xl bg-white/5 border border-white/10 p-7 sm:p-10 mb-8"><div className="flex flex-wrap gap-7 justify-between"><div><p className="text-blue-300 uppercase tracking-widest text-sm mb-3">Welcome back</p><h2 className="text-3xl font-bold mb-3">{data.businessName??(data.isOwner?'Owner dashboard':'Your account')}</h2><p className="text-blue-200 max-w-xl">Manage your advertisements, Connect Plate links and billing from one place.</p></div><div className="rounded-2xl bg-blue-600 p-6"><p className="text-sm uppercase tracking-widest mb-2">Advertising enrollment</p><p className="text-xl font-semibold">{data.enrollmentStatus?data.enrollmentStatus.replaceAll('_',' '):'No paid enrollment'}</p><Link href="/billing" className="inline-block underline mt-3">View billing details</Link></div></div></section>
  <section aria-label={analytics?'Connect Plate activity':'Account statistics'} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">{stats.map(([label,value])=><div key={label} className="rounded-2xl bg-white/5 border border-white/10 p-6"><p className="text-blue-200 mb-4">{label}</p><p className="text-4xl font-bold">{value}</p></div>)}</section>
  <p className="text-blue-200 mb-8">Counts cover recorded activity for your account across all dates. Connect Plate page views and link clicks may include repeat visits and automated traffic; they do not measure unique people or screen-ad impressions.</p>
  <section className="rounded-3xl bg-white/5 border border-white/10 p-7"><h2 className="text-2xl font-bold mb-5">{analytics?'Account tools':'Quick actions'}</h2><nav className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{tools.map(([label,href])=><Link key={href} href={href} className="rounded-xl bg-blue-900/60 border border-blue-400/20 p-4 font-semibold hover:bg-blue-800">{label}</Link>)}{analytics&&<Link href="/dashboard" className="rounded-xl border border-blue-400/20 p-4">Back to dashboard</Link>}{data.isOwner&&<Link href="/admin" className="rounded-xl bg-blue-600 p-4 font-semibold">Owner management</Link>}</nav></section></>}
 </div></main>;
}
