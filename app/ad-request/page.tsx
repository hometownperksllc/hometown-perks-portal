"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdRequestPage() {
  const [businessName, setBusinessName] = useState("");
  const [adType, setAdType] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitRequest(e: any) {
    e.preventDefault();

    setLoading(true);
    setStatus("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setStatus("You must be logged in.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("ad_requests").insert([
      {
        business_name: businessName,
        ad_type: adType,
        notes: notes,
        email: session.user.email,
        status: "Submitted",
      },
    ]);

    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Ad request submitted successfully.");
      setBusinessName("");
      setAdType("");
      setNotes("");
    }

    setLoading(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#020617 0%,#071a52 45%,#0b1f66 100%)",
        padding: "40px",
        color: "white",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "850px",
          margin: "0 auto",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "30px",
          padding: "40px",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            color: "#60a5fa",
            letterSpacing: "2px",
            textTransform: "uppercase",
            fontWeight: 700,
            marginBottom: "10px",
          }}
        >
          Merchant Portal
        </div>

        <h1
          style={{
            fontSize: "54px",
            marginTop: 0,
            marginBottom: "10px",
          }}
        >
          Submit Ad Request
        </h1>

        <p
          style={{
            color: "#c7d2fe",
            marginBottom: "40px",
            fontSize: "18px",
          }}
        >
          Send your next advertising request to the Hometown Perks design team.
        </p>

        <form
          onSubmit={submitRequest}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <input
            placeholder="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            style={inputStyle}
          />

          <select
            value={adType}
            onChange={(e) => setAdType(e.target.value)}
            required
            style={inputStyle}
          >
            <option value="">Select Ad Type</option>
            <option value="TV Ad">TV Ad</option>
            <option value="Social Media Graphic">Social Media Graphic</option>
            <option value="Connect Plate Update">
              Connect Plate Update
            </option>
            <option value="Website Promotion">
              Website Promotion
            </option>
          </select>

          <textarea
            placeholder="Describe what you want included in the advertisement..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={8}
            style={{
              ...inputStyle,
              resize: "vertical",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              background:
                "linear-gradient(135deg,#2563eb 0%,#3b82f6 100%)",
              border: "none",
              color: "white",
              padding: "18px",
              borderRadius: "18px",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "18px",
              boxShadow: "0 12px 30px rgba(37,99,235,.35)",
            }}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>

          {status && (
            <div
              style={{
                marginTop: "10px",
                color: "#93c5fd",
                fontWeight: 600,
              }}
            >
              {status}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "18px",
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.05)",
  color: "white",
  fontSize: "16px",
  outline: "none",
};