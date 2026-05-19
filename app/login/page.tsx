"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#020b2d", color: "white", padding: "40px", fontFamily: "Arial" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto", background: "#1e293b", padding: "32px", borderRadius: "24px" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "24px" }}>Merchant Login</h1>

        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />

          <button type="submit" style={buttonStyle}>Log In</button>
        </form>

        <a href="/signup" style={{ display: "block", marginTop: "20px", textAlign: "center", color: "#38bdf8", fontWeight: "bold", textDecoration: "none" }}>
          Create Merchant Account
        </a>

        {message && <p style={{ marginTop: "20px", color: "#38bdf8" }}>{message}</p>}
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "16px",
  borderRadius: "12px",
  border: "none",
};

const buttonStyle = {
  width: "100%",
  background: "#facc15",
  color: "black",
  padding: "14px",
  borderRadius: "12px",
  border: "none",
  fontWeight: "bold" as const,
  cursor: "pointer",
};