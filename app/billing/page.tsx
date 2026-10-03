'use client';
import {useEffect,useRef,useState} from 'react';
import Script from 'next/script';
import {supabase} from '@/lib/supabase';
type Billing={card_last_four?:string;card_brand?:string;consent_at?:string;live_date?:string;renewal_start_date?:string;cancellation_requested_at?:string;cancellation_confirmed_at?:string;paid_through?:string};
type Config={enabled:boolean;enrollment?:{status:string};billing?:Billing;applicationId?:string;locationId?:string;environment?:string;consentText?:string;consentVersion?:string};
type Card=Awaited<ReturnType<ReturnType<NonNullable<Window['Square']>['payments']>['card']>>;
export default function BillingPage(){
 const [config,setConfig]=useState<Config|null>(null),[message,setMessage]=useState(''),[ready,setReady]=useState(false),[accepted,setAccepted]=useState(false),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
 const card=useRef<Card|null>(null);
 async function refresh(){const {data:{session}}=await supabase.auth.getSession();if(!session){setMessage('Sign in to view billing.');return;}const r=await fetch('/api/billing/config',{headers:{Authorization:`Bearer ${session.access_token}`}});const d=await r.json();if(!r.ok){setMessage(d.error);return;}setConfig(d);}
 useEffect(()=>{supabase.auth.getSession().then(async ({data:{session}})=>{if(!session){setMessage('Sign in to view billing.');return;}const r=await fetch('/api/billing/config',{headers:{Authorization:`Bearer ${session.access_token}`}});const d=await r.json();if(r.ok)setConfig(d);else setMessage(d.error);}).catch(()=>setMessage('Billing details unavailable.')).finally(()=>setLoading(false));},[]);
 useEffect(()=>{
  if(!ready || !config?.enabled || !config.applicationId || !config.locationId || config.billing?.card_last_four || config.billing?.cancellation_requested_at || config.enrollment?.status!=='paid_pending_launch')return;
  let disposed=false,instance:Card|null=null;
  async function mount(){const payments=window.Square?.payments(config!.applicationId!,config!.locationId!);if(!payments)throw new Error();instance=await payments.card();if(disposed){await instance.destroy();return;}await instance.attach('#square-card');card.current=instance;}
  mount().catch(()=>setMessage('Secure card entry is unavailable. Please try again later.'));
  return()=>{disposed=true;card.current=null;void instance?.destroy();};
 },[ready,config]);
 async function save(){setBusy(true);setMessage('');try{
  const {data:{session}}=await supabase.auth.getSession();if(!session || !card.current || !accepted)throw new Error();
  const token=await card.current.tokenize({intent:'STORE',customerInitiated:true,sellerKeyedIn:false,billingContact:{email:session.user.email??''}});
  if(token.status!=='OK' || !token.token){setMessage('Check your card information and try again.');return;}
  const r=await fetch('/api/billing/card',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({sourceId:token.token,accept:true,consentVersion:config?.consentVersion})});
  const d=await r.json();if(!r.ok){setMessage(d.error);return;}await refresh();setMessage('Your payment method and consent were saved. No monthly charge was made.');
 }catch{setMessage('Unable to save your payment method.');}finally{setBusy(false);}}
 async function cancel(){if(!window.confirm('Cancel future advertising renewals? Your paid service period remains available.'))return;setBusy(true);try{
  const {data:{session}}=await supabase.auth.getSession();if(!session)throw new Error();
  const r=await fetch('/api/billing/cancel',{method:'POST',headers:{Authorization:`Bearer ${session.access_token}`}});const d=await r.json();setMessage(r.ok?(d.pendingConfirmation?'Cancellation recorded; provider confirmation is pending.':'Future renewals canceled. Service continues through your paid period.'):d.error);await refresh();
 }catch{setMessage('Unable to confirm cancellation. Email michael@hometownperksusa.com before your next billing date.');}finally{setBusy(false);}}
 const billing=config?.billing;
 return <main className="min-h-screen bg-slate-950 text-white p-6"><div className="max-w-2xl mx-auto py-10"><a className="text-blue-300" href="/dashboard">Merchant Dashboard</a><h1 className="text-3xl font-bold my-6">Advertising Billing</h1>
 {message&&<p role="status" className="my-5">{message}</p>}
 {!config?<p>{loading?'Checking billing…':'Sign in to view your advertising account.'} {!loading&&<a className="text-blue-300" href="/login">Sign in</a>}</p>:!config.enrollment?<p>No paid advertising enrollment is linked to this account.</p>:<><p>Status: {config.enrollment.status.replaceAll('_',' ')}</p><p className="my-4">Your initial $149 covers 30 calendar days beginning when your approved advertisement goes live. Monthly renewal is $149 with your separate authorization.</p>
 {billing?.live_date&&<p>Advertising began: {billing.live_date}</p>}{billing?.renewal_start_date&&<p>First monthly renewal date: {billing.renewal_start_date}</p>}{billing?.paid_through&&<p>Current recorded paid period ends: {billing.paid_through}</p>}
 {billing?.card_last_four&&<p className="my-4">Payment method: {billing.card_brand} ending {billing.card_last_four}</p>}
 {billing?.cancellation_requested_at?<p className="my-4">Renewal cancellation requested. {billing.cancellation_confirmed_at?'Confirmed with Square.':'Awaiting any outstanding provider confirmation.'}</p>:<>
 {!config.enabled?<p className="my-5">Monthly payment setup is not open yet.</p>:!billing?.card_last_four&&config.enrollment.status==='paid_pending_launch'?<section className="my-6 border border-slate-700 p-5 rounded"><h2 className="text-xl font-semibold">Authorize monthly renewal</h2><p className="my-4">{config.consentText}</p><div id="square-card"/><label className="flex gap-3 my-4"><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)}/>I authorize the monthly payments described above.</label><button className="bg-blue-600 p-3 rounded disabled:opacity-50" disabled={busy||!accepted||!ready} onClick={()=>void save()}>Save payment method and consent</button></section>:null}
 <button className="my-5 border border-slate-500 p-3 rounded" disabled={busy} onClick={()=>void cancel()}>Cancel future renewals</button></>}
 <p className="my-5">Billing questions or cancellation help: <a className="text-blue-300" href="mailto:michael@hometownperksusa.com">michael@hometownperksusa.com</a></p></>}
 {config?.enabled&&<Script src={config.environment==='sandbox'?'https://sandbox.web.squarecdn.com/v1/square.js':'https://web.squarecdn.com/v1/square.js'} onReady={()=>setReady(true)} onError={()=>setMessage('Secure card entry failed to load.')}/>}</div></main>;
}
