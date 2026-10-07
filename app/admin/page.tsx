'use client';
import {useEffect,useState,type FormEvent} from 'react';
import {supabase} from '@/lib/supabase';
type Merchant={id:string;business_name:string;contact_name:string;email:string;phone:string;onboarding_status:string};
type Enrollment={id:string;user_id:string;merchant_id:string;status:string;amount_cents:number;square_environment:string};
type Host={id:string;display_name:string;legal_name?:string;address?:string;signed_at?:string;installed_at?:string;active:boolean};
type Ad={id:string;user_id:string;promotion_title?:string;status:string;merchant_approval_status:string};
type Billing={enrollment_id:string;card_last_four?:string;consent_at?:string;cancellation_requested_at?:string;renewal_start_date?:string};
type Overview={merchants:Merchant[];enrollments:Enrollment[];enrollmentOpen:boolean;recurringEnabled:boolean;hosts:Host[];ads:Ad[];billing:Billing[]};
async function ownerRequest(url:string,body?:unknown){
 const {data:{session}}=await supabase.auth.getSession();if(!session)throw Error('Sign in with your Hometown Perks owner account.');
 const response=await fetch(url,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${session.access_token}`,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const result=await response.json();if(!response.ok)throw Error(result.error??'Unable to complete request.');return result;
}
export default function AdminPage(){
 const [data,setData]=useState<Overview|null>(null),[message,setMessage]=useState('Checking owner access…'),[busy,setBusy]=useState(false);
 useEffect(()=>{ownerRequest('/api/admin/overview').then(result=>{setData(result);setMessage('');}).catch(error=>setMessage(error.message));},[]);
 async function refresh(){setData(await ownerRequest('/api/admin/overview'));}
 async function host(event:FormEvent<HTMLFormElement>,id:string){event.preventDefault();setBusy(true);setMessage('');try{
  const fields=new FormData(event.currentTarget),file=fields.get('agreement');
  if(!(file instanceof File) || !file.size)throw Error('Select the signed host agreement.');
  const signedPath=`${id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g,'_')}`;
  const {error}=await supabase.storage.from('host-agreements').upload(signedPath,file);
  if(error)throw Error('Unable to upload agreement. Use a PDF, JPG or PNG under 10 MB.');
  await ownerRequest('/api/admin/hosts',{id,legalName:fields.get('legalName'),address:fields.get('address'),signedPath,confirmSigned:fields.get('confirmSigned')==='on',confirmInstalled:fields.get('confirmInstalled')==='on'});
  await refresh();setMessage('Signed host agreement recorded.');
 }catch(error){setMessage(error instanceof Error?error.message:'Unable to save host.');}finally{setBusy(false);}}
 async function reconcile(enrollmentId:string){setBusy(true);try{await ownerRequest('/api/admin/reconcile',{enrollmentId});await refresh();setMessage('Payment records refreshed from Square.');}catch(error){setMessage(error instanceof Error?error.message:'Unable to refresh payment.');}finally{setBusy(false);}}
 async function activate(event:FormEvent<HTMLFormElement>,enrollmentId:string){event.preventDefault();const fields=new FormData(event.currentTarget);
  if(!window.confirm('Confirm this approved advertisement is live at every contracted location. This starts the prepaid service period and schedules $149 monthly renewals after 30 days.'))return;
  setBusy(true);setMessage('');try{const result=await ownerRequest('/api/admin/activate',{enrollmentId,adRequestId:fields.get('adRequestId'),confirmAdLive:fields.get('confirmAdLive')==='on'});await refresh();setMessage(`Service activation recorded. First renewal: ${result.firstRenewalDate}.`);}catch(error){setMessage(error instanceof Error?error.message:'Unable to activate.');}finally{setBusy(false);}
 }
 return <main className="min-h-screen bg-slate-950 text-white p-6"><div className="max-w-4xl mx-auto py-8"><h1 className="text-3xl font-bold mb-6">Hometown Perks Merchant Management</h1>
 {message&&<p role="status" className="my-4">{message}</p>}{!data&&<a className="text-blue-300" href="/login">Sign in</a>}
 {data&&<><p>Paid enrollment: {data.enrollmentOpen?'Open':'Closed'}</p><p>Monthly billing activation: {data.recurringEnabled?'Enabled':'Closed for testing'}</p><a className="block my-5 text-blue-300" href="/admin/ad-requests">Review ad requests</a>
 <a className="block my-5 text-blue-300" href="/admin/sandbox">Square sandbox verification</a><a className="block my-5 text-blue-300" href="/admin/billing-setup">Production billing setup</a><a className="block my-5 text-blue-300" href="/admin/documents">Merchant agreements and documents</a><a className="block my-5 text-blue-300" href="/admin/inquiries">Advertiser inquiries</a><h2 className="text-2xl font-semibold my-5">Screen hosts</h2><p>A location is confirmed only after its signed agreement is recorded. Installation must be complete before ad activation.</p>
 {data.hosts.map(h=><section className="my-5 p-5 rounded bg-slate-800" key={h.id}><h3 className="text-xl font-semibold">{h.display_name}</h3><p className="my-3">{h.signed_at?'Signed agreement recorded':'Verbal interest only'} · {h.installed_at?'Installation recorded':'Not installed'}</p>
 <form onSubmit={e=>void host(e,h.id)}><label className="block my-3">Host legal entity<input className="block bg-slate-900 p-2 w-full rounded mt-2" name="legalName" defaultValue={h.legal_name??''} required maxLength={200}/></label><label className="block my-3">Installation address<input className="block bg-slate-900 p-2 w-full rounded mt-2" name="address" defaultValue={h.address??''} required maxLength={500}/></label><label className="block my-3">Signed agreement<input className="block mt-2" type="file" name="agreement" required accept="application/pdf,image/jpeg,image/png"/></label><label className="block my-3"><input type="checkbox" name="confirmSigned" required/> I verified this agreement is signed by the authorized host and Hometown Perks.</label><label className="block my-3"><input type="checkbox" name="confirmInstalled" defaultChecked={!!h.installed_at}/> The screen is installed and operating at this location.</label><button disabled={busy} className="bg-blue-600 p-3 rounded">Record agreement and installation status</button></form></section>)}
 <h2 className="text-2xl font-semibold my-5">Merchants</h2>{!data.merchants.length&&<p>No enrolled merchants yet.</p>}
 {data.merchants.map(m=><section className="my-5 p-5 rounded bg-slate-800" key={m.id}><h3 className="text-xl font-semibold">{m.business_name}</h3><p>{m.contact_name} · {m.email} · {m.phone}</p><p>{m.onboarding_status}</p>{data.enrollments.filter(e=>e.merchant_id===m.id).map(e=>{
  const b=data.billing.find(b=>b.enrollment_id===e.id),ads=data.ads.filter(a=>a.user_id===e.user_id&&a.merchant_approval_status==='Approved'&&['Approved','Scheduled','Running'].includes(a.status));
  return <div key={e.id}><p className="my-3">{e.status.replaceAll('_',' ')} · ${(e.amount_cents/100).toFixed(2)} · {e.square_environment}</p><button className="my-3 border p-2 rounded" disabled={busy} onClick={()=>void reconcile(e.id)}>Refresh payment from Square</button><p>Autopay: {b?.consent_at?`Authorized, card ending ${b.card_last_four}`:'Not authorized'}</p>{b?.renewal_start_date&&<p>First renewal: {b.renewal_start_date}</p>}
  {e.status==='paid_pending_launch'&&<form className="mt-4" onSubmit={event=>void activate(event,e.id)}><label>Approved advertisement<select name="adRequestId" required className="block my-3 bg-slate-900 p-2"><option value="">Select approved creative</option>{ads.map(a=><option key={a.id} value={a.id}>{a.promotion_title||a.id}</option>)}</select></label><label className="block my-3"><input type="checkbox" required name="confirmAdLive"/> This ad is live at every contracted host.</label><button className="bg-blue-600 p-3 rounded disabled:opacity-50" disabled={busy||!data.recurringEnabled||!b?.consent_at||!!b?.cancellation_requested_at||!ads.length}>Activate service and schedule renewal</button></form>}</div>;
 })}</section>)}</>}
 </div></main>;
}
