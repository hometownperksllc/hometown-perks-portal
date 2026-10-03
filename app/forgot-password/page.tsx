"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function sendRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setMessage(error ? "Unable to send the setup email. Please wait a minute and try again, or contact info@hometownperksusa.com." : "If this email has an account, a password setup link has been sent. Check your inbox and spam folder. Open the link and choose your own password.");
    } catch {
      setMessage("Unable to send the setup email. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="min-h-screen bg-[#020b2d] px-6 py-12 text-white"><section className="mx-auto max-w-lg rounded-3xl bg-slate-800 p-8">
    <h1 className="mb-4 text-3xl font-bold">Set up or reset your password</h1>
    <p className="mb-6">Use the email address already linked to your Hometown Perks account. You will choose your password privately after opening the email link.</p>
    <form onSubmit={sendRecovery}><label className="block" htmlFor="recovery-email">Email Address</label><input id="recovery-email" type="email" autoComplete="email" required value={email} onChange={event=>setEmail(event.target.value)} className="my-3 w-full rounded-xl bg-white p-3 text-slate-950"/>
      <button disabled={busy} className="w-full rounded-xl bg-yellow-400 p-3 font-bold text-black disabled:opacity-50">{busy ? "Sending…" : "Send password setup email"}</button></form>
    {message&&<p role="status" className="mt-5">{message}</p>}<a href="/login" className="mt-6 block text-sky-300">Back to login</a>
  </section></main>;
}
