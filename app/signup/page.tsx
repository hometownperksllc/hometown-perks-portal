"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignupPage() {
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("Founding Community Partner");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: any) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;

    if (!userId) {
      setMessage("Account created. Please check your email to confirm your account.");
      setLoading(false);
      return;
    }

    const { error: merchantError } = await supabase.from("merchants").insert([
      {
        user_id: userId,
        business_name: businessName,
        contact_name: contactName,
        phone,
        email,
        plan,
        onboarding_status: "New",
      },
    ]);

    if (merchantError) {
      setMessage(merchantError.message);
    } else {
      setMessage("Account created successfully.");
      setBusinessName("");
      setContactName("");
      setPhone("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    }

    setLoading(false);
  }

  return (
    <main style={pageStyle}>
      <section style={navStyle}>
        <a href="/" style={brandStyle}>
          Hometown Perks
        </a>

        <div style={navLinks}>
          <a href="/" style={navLink}>
            Home
          </a>
          <a href="/login" style={navButton}>
            Login
          </a>
        </div>
      </section>

      <section style={signupGrid}>
        <div style={introCard}>
          <p style={eyebrow}>Merchant Signup</p>

          <h1 style={heroTitle}>
            Join the local visibility network.
          </h1>

          <p style={heroText}>
            Create your merchant account to manage advertising requests,
            Connect Plate setup, business visibility tools, and customer
            engagement analytics.
          </p>

          <div style={miniGrid}>
            <div style={miniCard}>
              <strong>TV Ads</strong>
              <span>Submit screen advertising requests</span>
            </div>

            <div style={miniCard}>
              <strong>Connect Plate</strong>
              <span>QR/NFC tools for customer engagement</span>
            </div>

            <div style={miniCard}>
              <strong>Dashboard</strong>
              <span>Track ads, scans, and business activity</span>
            </div>

            <div style={miniCard}>
              <strong>Local Reach</strong>
              <span>Get seen across the Hometown Perks network</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSignup} style={formCard}>
          <p style={eyebrow}>Create Account</p>

          <h2 style={formTitle}>Merchant Details</h2>

          <div style={fieldGroup}>
            <label style={labelStyle}>Business Name</label>
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              style={inputStyle}
              placeholder="Example: Larissa Floral"
            />
          </div>

          <div style={fieldGroup}>
            <label style={labelStyle}>Contact Name</label>
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
              style={inputStyle}
              placeholder="Main contact name"
            />
          </div>

          <div style={fieldGroup}>
            <label style={labelStyle}>Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={inputStyle}
              placeholder="606-555-0000"
            />
          </div>

          <div style={fieldGroup}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder="business@email.com"
            />
          </div>

          <div style={fieldGroup}>
            <label style={labelStyle}>Plan</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              style={inputStyle}
            >
              <option value="Founding Community Partner">
                Founding Community Partner — $149/mo
              </option>
              <option value="Founding Growth Partner">
                Founding Growth Partner — $249/mo
              </option>
              <option value="Founding Premier Partner">
                Founding Premier Partner — $349/mo
              </option>
            </select>
          </div>

          <div style={fieldGroup}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              placeholder="Create a password"
            />
          </div>

          <button type="submit" disabled={loading} style={submitButton}>
            {loading ? "Creating Account..." : "Create Merchant Account"}
          </button>

          {message && <p style={messageStyle}>{message}</p>}

          <p style={smallText}>
            Already have an account?{" "}
            <a href="/login" style={{ color: "#93c5fd", fontWeight: 700 }}>
              Log in here
            </a>
          </p>
        </form>
      </section>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background:
    "linear-gradient(135deg, #020617 0%, #071a52 45%, #0b1f66 100%)",
  color: "white",
  fontFamily: "Arial",
  padding: "38px",
};

const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "60px",
  flexWrap: "wrap" as const,
  gap: "20px",
};

const brandStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "22px",
  fontWeight: 800,
};

const navLinks = {
  display: "flex",
  alignItems: "center",
  gap: "18px",
};

const navLink = {
  color: "#dbeafe",
  textDecoration: "none",
  fontWeight: 700,
};

const navButton = {
  background: "linear-gradient(90deg,#2563eb,#3b82f6)",
  color: "white",
  padding: "12px 20px",
  borderRadius: "14px",
  textDecoration: "none",
  fontWeight: 800,
};

const signupGrid = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(420px, 520px)",
  gap: "34px",
  alignItems: "start",
};

const introCard = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "30px",
  padding: "44px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 60px rgba(0,0,0,.35)",
};

const formCard = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "30px",
  padding: "38px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 60px rgba(0,0,0,.35)",
};

const eyebrow = {
  color: "#60a5fa",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  fontWeight: 800,
  marginBottom: "12px",
};

const heroTitle = {
  fontSize: "62px",
  lineHeight: 1,
  letterSpacing: "-2px",
  margin: "0 0 24px",
};

const heroText = {
  color: "#c7d2fe",
  fontSize: "20px",
  lineHeight: 1.7,
  maxWidth: "760px",
  marginBottom: "30px",
};

const miniGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "16px",
  marginTop: "26px",
};

const miniCard = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "20px",
  padding: "20px",
  display: "flex",
  flexDirection: "column" as const,
  gap: "8px",
  color: "#dbeafe",
};

const formTitle = {
  fontSize: "36px",
  marginTop: 0,
  marginBottom: "26px",
};

const fieldGroup = {
  marginBottom: "18px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  color: "#dbeafe",
  fontWeight: 700,
};

const inputStyle = {
  width: "100%",
  padding: "16px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontSize: "16px",
  outline: "none",
};

const submitButton = {
  width: "100%",
  background: "linear-gradient(90deg,#2563eb,#3b82f6)",
  color: "white",
  border: "none",
  padding: "18px",
  borderRadius: "18px",
  fontWeight: 800,
  fontSize: "16px",
  cursor: "pointer",
  boxShadow: "0 8px 30px rgba(37,99,235,.35)",
  marginTop: "8px",
};

const messageStyle = {
  color: "#93c5fd",
  fontWeight: 700,
  marginTop: "18px",
};

const smallText = {
  color: "#c7d2fe",
  marginTop: "20px",
  textAlign: "center" as const,
};