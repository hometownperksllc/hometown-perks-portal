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

      if (!session?.user) return;

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
      color: "#19c2ff",
    },
    {
      label: "Remaining Ads",
      value: "1",
      color: "#38f2c2",
    },
    {
      label: "Approved Ads",
      value: "0",
      color: "#00d4ff",
    },
    {
      label: "Active Campaigns",
      value: "0",
      color: "#00ffa3",
    },
    {
      label: "Total Scans",
      value: "0",
      color: "#19c2ff",
    },
    {
      label: "Website Clicks",
      value: "0",
      color: "#38f2c2",
    },
    {
      label: "Facebook Clicks",
      value: "0",
      color: "#00d4ff",
    },
    {
      label: "Instagram Clicks",
      value: "0",
      color: "#00ffa3",
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #020b3d 0%, #031b69 45%, #062b8f 100%)",
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
              color: "#38f2c2",
              fontSize: "14px",
              marginBottom: "8px",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            Merchant Dashboard
          </div>

          <h1
            style={{
              fontSize: "64px",
              lineHeight: "1",
              margin: 0,
              fontWeight: 700,
            }}
          >
            Hometown Perks
          </h1>
        </div>

        <button
          onClick={logout}
          style={{
            background: "linear-gradient(90deg,#19c2ff,#38f2c2)",
            border: "none",
            color: "#02133b",
            padding: "14px 28px",
            borderRadius: "14px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "16px",
            boxShadow: "0 0 20px rgba(56,242,194,.25)",
          }}
        >
          Log Out
        </button>
      </div>

      {/* HERO CARD */}
      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "28px",
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
                color: "#38f2c2",
                fontSize: "15px",
                marginBottom: "14px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Welcome Back
            </div>

            <h2
              style={{
                fontSize: "42px",
                marginTop: 0,
                marginBottom: "14px",
              }}
            >
              {merchant?.business_name || "Business Dashboard"}
            </h2>

            <p
              style={{
                color: "#c5d4ff",
                fontSize: "18px",
                lineHeight: "1.7",
                maxWidth: "700px",
              }}
            >
              Manage your Connect Plate, advertising performance,
              customer engagement, and business visibility all in one place.
            </p>
          </div>

          <div
            style={{
              minWidth: "260px",
              background:
                "linear-gradient(135deg,#19c2ff 0%, #38f2c2 100%)",
              borderRadius: "24px",
              padding: "28px",
              color: "#02133b",
              fontWeight: 700,
              boxShadow: "0 15px 35px rgba(25,194,255,.25)",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                opacity: 0.8,
                marginBottom: "8px",
                textTransform: "uppercase",
              }}
            >
              Current Plan
            </div>

            <div
              style={{
                fontSize: "34px",
                marginBottom: "12px",
              }}
            >
              Founding Partner
            </div>

            <div style={{ fontSize: "17px", lineHeight: "1.6" }}>
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
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: "22px",
          marginBottom: "40px",
        }}
      >
        {stats.map((item, index) => (
          <div
            key={index}
            style={{
              background: "rgba(255,255,255,0.06)",
              borderRadius: "24px",
              padding: "28px",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(10px)",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 12px 30px rgba(0,0,0,.25)",
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
                fontSize: "42px",
                fontWeight: 700,
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
            background: "rgba(255,255,255,0.06)",
            borderRadius: "28px",
            padding: "35px",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 15px 40px rgba(0,0,0,.25)",
          }}
        >
          <div
            style={{
              color: "#38f2c2",
              fontSize: "14px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Growth Insights
          </div>

          <h2
            style={{
              marginTop: 0,
              fontSize: "36px",
              marginBottom: "20px",
            }}
          >
            Merchant Analytics
          </h2>

          <div
            style={{
              height: "260px",
              borderRadius: "20px",
              background:
                "linear-gradient(135deg, rgba(25,194,255,.12), rgba(56,242,194,.12))",
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
            background: "rgba(255,255,255,0.06)",
            borderRadius: "28px",
            padding: "35px",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 15px 40px rgba(0,0,0,.25)",
          }}
        >
          <div
            style={{
              color: "#38f2c2",
              fontSize: "14px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Quick Actions
          </div>

          <h2
            style={{
              marginTop: 0,
              fontSize: "34px",
              marginBottom: "20px",
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
            <button style={buttonStyle}>
              Submit New Ad Request
            </button>

            <button style={buttonStyle}>
              Edit Connect Plate
            </button>

            <button style={buttonStyle}>
              View Analytics
            </button>

            <button style={buttonStyle}>
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

const buttonStyle = {
  background: "linear-gradient(90deg,#19c2ff,#38f2c2)",
  border: "none",
  color: "#02133b",
  padding: "18px",
  borderRadius: "18px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "16px",
  boxShadow: "0 10px 25px rgba(56,242,194,.15)",
};