"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(()=>{
    let active=true;
    const {data:{subscription}}=supabase.auth.onAuthStateChange(event=>{
      if(active&&event==="PASSWORD_RECOVERY") {setReady(true);setChecking(false);}
    });
    // getUser waits for the SDK to exchange the recovery link and verifies the session.
    supabase.auth.getUser().then(({data,error})=>{
      if(active) {setReady(Boolean(!error&&data.user));setChecking(false);}
    }).catch(()=>{if(active) {setReady(false);setChecking(false);}});
    return ()=>{active=false;subscription.unsubscribe();};
  },[]);

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(busy||!ready) return;
    if(password.length<12) {setMessage("Use at least 12 characters.");return;}
    if(password!==confirmation) {setMessage("The passwords do not match.");return;}
    setBusy(true);setMessage("");
    try {
      const {error}=await supabase.auth.updateUser({password});
      if(error) {setMessage("Unable to save this password. Try a stronger password or request a fresh setup link.");return;}
      setPassword("");setConfirmation("");setComplete(true);setReady(false);
      await supabase.auth.signOut({scope:"local"});
    } catch {setMessage("Unable to save your password. Please try again.");}
    finally {setBusy(false);}
  }

  return <main className="min-h-screen bg-[#020b2d] px-6 py-12 text-white"><section className="mx-auto max-w-lg rounded-3xl bg-slate-800 p-8">
    <h1 className="mb-5 text-3xl font-bold">Choose your password</h1>
    {complete?<p role="status">Your password is saved. Sign in with your email and new password.</p>:checking?<p>Checking your setup link…</p>:!ready?<p>This setup link is missing or has expired. <a className="text-sky-300" href="/forgot-password">Request a new link</a>.</p>:<form onSubmit={savePassword}>
      <label className="block" htmlFor="new-password">New password</label><input id="new-password" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={event=>setPassword(event.target.value)} className="my-3 w-full rounded-xl bg-white p-3 text-slate-950"/>
      <label className="block" htmlFor="confirm-password">Confirm password</label><input id="confirm-password" type="password" autoComplete="new-password" minLength={12} required value={confirmation} onChange={event=>setConfirmation(event.target.value)} className="my-3 w-full rounded-xl bg-white p-3 text-slate-950"/>
      <button disabled={busy} className="w-full rounded-xl bg-yellow-400 p-3 font-bold text-black disabled:opacity-50">{busy?"Saving…":"Save password"}</button></form>}
    {message&&<p role="status" className="mt-5">{message}</p>}<a href="/login" className="mt-6 block text-sky-300">Go to login</a>
  </section></main>;
}
