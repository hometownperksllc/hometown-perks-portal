"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const [merchant, setMerchant] = useState<any>(null);

  useEffect(() => {
    async function loadMerchant() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        window.location.href = "/login";
        return;
      }

      const { data } = await supabase
        .from("merchants")
        .select("*")
        .eq("email", session.user.email)
        .single();

      setMerchant(data);
    }

    loadMerchant();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const stats = [
    {
      label: "Monthly Requests",
      value: "0 / 1",
      color: "#3b82f6",
    },
    {
      label: "Remaining Ads",
      value: "1",
      color: "#60a5fa",
    },
    {
      label: "Approved Ads",
      value: "0",
      color: "#2563eb",
    },
    {
      label: "Active Campaigns",
      value: "0",
      color: "#1d4ed8",
    },
    {
      label: "Total Scans",
      value: "0",
      color: "#3b82f6",
    },
    {
      label: "Website Clicks",
      value: "0",
      color: "#60a5fa",
    },
    {
      label: "Facebook Clicks",
      value: "0",
      color: "#2563eb",
    },
    {
      label: "Instagram Clicks",
      value: "0",
      color: "#1d4ed8",
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #020617 0%, #071a52 45%, #0b1f66 100%)",
        padding: "40px",
        color: "white",
        fontFamily: "Arial",
      }}
    >
      {/* TOP BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "50px",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div>
          <div
            style={{
              color: "#60a5fa",
              fontSize: "14px",
              marginBottom: "8px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Merchant Dashboard
          </div>

          <h1
            style={{
              fontSize: "72px",
              lineHeight: "1",
              margin: 0,
              fontWeight: 800,
              letterSpacing: "-2px",
            }}
          >
            Hometown Perks
          </h1>
        </div>

        <button
          onClick={logout}
          style={{
            background: "linear-gradient(90deg,#2563eb,#3b82f6)",
            border: "none",
            color: "white",
            padding: "14px 28px",
            borderRadius: "16px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "16px",
            boxShadow: "0 8px 30px rgba(37,99,235,.35)",
          }}
        >
          Log Out
        </button>
      </div>

      {/* HERO CARD */}
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "30px",
          padding: "40px",
          marginBottom: "40px",
          backdropFilter: "blur(12px)",
          boxShadow: "0 20px 60px rgba(0,0,0,.35)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "30px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "280px" }}>
            <div
              style={{
                color: "#60a5fa",
                fontSize: "14px",
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "2px",
                fontWeight: 700,
              }}
            >
              Welcome Back
            </div>

            <h2
              style={{
                fontSize: "48px",
                marginTop: 0,
                marginBottom: "14px",
                fontWeight: 700,
              }}
            >
              {merchant?.business_name || "Business Dashboard"}
            </h2>

            <p
              style={{
                color: "#c7d2fe",
                fontSize: "18px",
                lineHeight: "1.7",
                maxWidth: "700px",
              }}
            >
              Manage your Connect Plate, advertising performance,
              customer engagement, and business visibility all in one place.
            </p>
          </div>

          {/* CURRENT PLAN */}
          <div
            style={{
              minWidth: "320px",
              background:
                "linear-gradient(135deg,#2563eb 0%, #3b82f6 100%)",
              borderRadius: "28px",
              padding: "32px",
              color: "white",
              fontWeight: 700,
              boxShadow: "0 20px 45px rgba(37,99,235,.35)",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                opacity: 0.9,
                marginBottom: "10px",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              Current Plan
            </div>

            <div
              style={{
                fontSize: "42px",
                marginBottom: "14px",
                lineHeight: "1.1",
              }}
            >
              Founding Partner
            </div>

            <div
              style={{
                fontSize: "17px",
                lineHeight: "1.7",
                color: "rgba(255,255,255,.92)",
              }}
            >
              Early access business partner with dashboard tools and Connect
              Plate analytics.
            </div>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "22px",
          marginBottom: "40px",
        }}
      >
        {stats.map((item, index) => (
          <div
            key={index}
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "24px",
              padding: "28px",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 12px 30px rgba(0,0,0,.22)",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "4px",
                background: item.color,
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />

            <div
              style={{
                color: "#9fb5ff",
                fontSize: "15px",
                marginBottom: "14px",
              }}
            >
              {item.label}
            </div>

            <div
              style={{
                fontSize: "44px",
                fontWeight: 800,
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* LOWER GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "24px",
        }}
      >
        {/* ANALYTICS */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "30px",
            padding: "35px",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 15px 40px rgba(0,0,0,.25)",
          }}
        >
          <div
            style={{
              color: "#60a5fa",
              fontSize: "14px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "10px",
              fontWeight: 700,
            }}
          >
            Growth Insights
          </div>

          <h2
            style={{
              marginTop: 0,
              fontSize: "38px",
              marginBottom: "22px",
            }}
          >
            Merchant Analytics
          </h2>

          <div
            style={{
              height: "280px",
              borderRadius: "24px",
              background:
                "linear-gradient(135deg, rgba(59,130,246,.14), rgba(37,99,235,.08))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#b9c9ff",
              fontSize: "20px",
              border: "1px dashed rgba(255,255,255,.12)",
            }}
          >
            Charts & analytics section
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "30px",
            padding: "35px",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 15px 40px rgba(0,0,0,.25)",
          }}
        >
          <div
            style={{
              color: "#60a5fa",
              fontSize: "14px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "10px",
              fontWeight: 700,
            }}
          >
            Quick Actions
          </div>

          <h2
            style={{
              marginTop: 0,
              fontSize: "38px",
              marginBottom: "24px",
            }}
          >
            Tools
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
<button
  style={buttonStyle}
  onClick={() => (window.location.href = "/ad-request")}
>
  Submit New Ad Request
</button>

<button
  style={buttonStyle}
  onClick={() => (window.location.href = "/edit-connect-plate")}
>
  Edit Connect Plate
</button>

<button
  style={buttonStyle}
  onClick={() => (window.location.href = "/analytics")}
>
  View Analytics
</button>

<button
  style={buttonStyle}
  onClick={() => (window.location.href = "/upgrade")}
>
  Upgrade Plan
</button>
          </div>
        </div>
      </div>
    </main>
  );
}

const buttonStyle = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(96,165,250,.25)",
  color: "white",
  padding: "18px",
  borderRadius: "18px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "16px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 10px 25px rgba(0,0,0,.25)",
};