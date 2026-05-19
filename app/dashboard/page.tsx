"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import QRCodeBlock from "./QRCodeBlock";

export default function DashboardPage() {

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [plateSetup, setPlateSetup] = useState<any>(null);
  const [requestsUsed, setRequestsUsed] = useState(0);
  const [monthlyLimit, setMonthlyLimit] = useState(1);
  const [adRequests, setAdRequests] = useState<any[]>([]);

  const [scanStats, setScanStats] = useState({
    total: 0,
    thisMonth: 0,
    today: 0,
    website: 0,
    facebook: 0,
    instagram: 0,
    reviews: 0,
    phone: 0,
    peakHour: "",
    topPlatformPercent: 0,
    topPlatform: "",
  });

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: merchants } = await supabase
        .from("merchants")
        .select("*")
        .eq("user_id", user.id)
        .limit(1);

      const merchantData = merchants?.[0];
      setMerchant(merchantData);

      const merchantPlan = merchantData?.plan || "";
      const limit =
        merchantPlan === "premier" ||
        merchantPlan === "Founding Premier Partner"
          ? 3
          : 1;

      setMonthlyLimit(limit);

      const currentMonth = new Date().toISOString().slice(0, 7);

      const { data: adRequests } = await supabase
        .from("ad_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setAdRequests(adRequests || []);

      const { data: scans } = await supabase
        .from("connect_plate_scans")
        .select("*")
        .eq("user_id", user.id);

      const { data: clicks } = await supabase
        .from("connect_plate_link_clicks")
        .select("*")
        .eq("user_id", user.id);

      const today = new Date().toISOString().slice(0, 10);

      const todayCount =
        scans?.filter((s) => s.scanned_at?.startsWith(today)).length || 0;

      const monthCount =
        scans?.filter((s) => s.scanned_at?.startsWith(currentMonth)).length ||
        0;

      const websiteClicks =
        clicks?.filter((c) => c.link_type === "website").length || 0;
      const facebookClicks =
        clicks?.filter((c) => c.link_type === "facebook").length || 0;
      const instagramClicks =
        clicks?.filter((c) => c.link_type === "instagram").length || 0;
      const reviewClicks =
        clicks?.filter((c) => c.link_type === "google_review").length || 0;
      const phoneClicks =
        clicks?.filter((c) => c.link_type === "phone").length || 0;

      const groupedHours: Record<string, number> = {};

      scans?.forEach((scan: any) => {
        const dateValue = scan.scanned_at || scan.created_at;
        if (!dateValue) return;

        const hour = new Date(dateValue).getHours();
        groupedHours[hour] = (groupedHours[hour] || 0) + 1;
      });

      let peakHour = "";
      let peakCount = 0;

      Object.entries(groupedHours).forEach(([hour, count]) => {
        if (count > peakCount) {
          peakCount = count;
          peakHour = hour;
        }
      });

      const platformStats = [
        { label: "Website", value: websiteClicks },
        { label: "Facebook", value: facebookClicks },
        { label: "Instagram", value: instagramClicks },
        { label: "Reviews", value: reviewClicks },
        { label: "Phone", value: phoneClicks },
      ];

      const topPlatformData = [...platformStats].sort(
        (a, b) => b.value - a.value
      )[0];

      const totalPlatformClicks =
        websiteClicks +
        facebookClicks +
        instagramClicks +
        reviewClicks +
        phoneClicks;

      const topPlatformPercent =
        totalPlatformClicks > 0
          ? Math.round((topPlatformData.value / totalPlatformClicks) * 100)
          : 0;

      setScanStats({
        total: scans?.length || 0,
        thisMonth: monthCount,
        today: todayCount,
        website: websiteClicks,
        facebook: facebookClicks,
        instagram: instagramClicks,
        reviews: reviewClicks,
        phone: phoneClicks,
        peakHour,
        topPlatform: topPlatformData.label,
        topPlatformPercent,
      });

      const used = adRequests?.filter(
        (r) => r.request_month === currentMonth && r.is_extra_paid === false
      ).length;

      setRequestsUsed(used || 0);

const { data: plates } = await supabase
  .from("connect_plate_setups")
  .select("*")
  .eq("user_id", user.id)
  .limit(1);
      setPlateSetup(plates?.[0]);

      setLoading(false);
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <main style={pageStyle}>Loading...</main>;
  }

  if (!user) {
    return (
      <main style={pageStyle}>
        <h1>Please log in.</h1>
        <a href="/login" style={yellowButton}>
          Go to Login
        </a>
      </main>
    );
  }

  const approvedCount = adRequests.filter((r) => r.status === "Approved").length;
  const pendingCount = adRequests.filter((r) => r.status !== "Approved").length;
  const latestRequest = adRequests[0];

  return (
    <main style={pageStyle}>
      <h1 style={titleStyle}>Hometown Perks Dashboard</h1>

      <button
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/login";
        }}
        style={logoutButton}
      >
        Log Out
      </button>

      <p style={subtitleStyle}>
        Manage your business profile, Connect Plate, and advertising requests.
      </p>

      <div style={statsGrid}>
        <div style={statCard}>
          <p>Monthly Requests</p>
          <h2>
            {requestsUsed} / {monthlyLimit}
          </h2>
        </div>

        <div style={statCard}>
          <p>Remaining</p>
          <h2>{Math.max(monthlyLimit - requestsUsed, 0)}</h2>
        </div>

        <div style={statCard}>
          <p>Approved Ads</p>
          <h2>{approvedCount}</h2>
        </div>

        <div style={statCard}>
          <p>Active/Pending</p>
          <h2>{pendingCount}</h2>
        </div>

        <div style={statCard}>
          <p>Total Scans</p>
          <h2>{scanStats.total}</h2>
        </div>

        <div style={statCard}>
          <p>Scans This Month</p>
          <h2>{scanStats.thisMonth}</h2>
        </div>

        <div style={statCard}>
          <p>Scans Today</p>
          <h2>{scanStats.today}</h2>
        </div>

        <div style={statCard}>
          <p>Website Clicks</p>
          <h2>{scanStats.website}</h2>
        </div>

        <div style={statCard}>
          <p>Facebook Clicks</p>
          <h2>{scanStats.facebook}</h2>
        </div>

        <div style={statCard}>
          <p>Instagram Clicks</p>
          <h2>{scanStats.instagram}</h2>
        </div>

        <div style={statCard}>
          <p>Review Clicks</p>
          <h2>{scanStats.reviews}</h2>
        </div>

        <div style={statCard}>
          <p>Phone Clicks</p>
          <h2>{scanStats.phone}</h2>
        </div>
      </div>

      <div
        style={{
          ...cardStyle,
          marginBottom: "24px",
          maxWidth: "650px",
        }}
      >
        <h2>Merchant Growth Insights</h2>

        <p>Website Clicks: {scanStats.website}</p>
        <p>Facebook Clicks: {scanStats.facebook}</p>
        <p>Instagram Clicks: {scanStats.instagram}</p>
        <p>Review Clicks: {scanStats.reviews}</p>
        <p>Phone Clicks: {scanStats.phone}</p>

        <p style={insightText}>
          Top Action: {scanStats.topPlatform || "No clicks yet"}
        </p>

        <p style={insightText}>
          {scanStats.topPlatformPercent > 0
            ? `${scanStats.topPlatform} makes up ${scanStats.topPlatformPercent}% of customer link activity.`
            : "No customer link activity has been recorded yet."}
        </p>

        <p style={insightText}>
          {scanStats.peakHour
            ? `Most scans are happening around ${formatHour(
                scanStats.peakHour
              )}.`
            : "No peak scan time available yet."}
        </p>
      </div>

      <div style={gridStyle}>
        <div style={cardStyle}>
          <h2>Business Profile</h2>
          <p>
            <strong>Business Name:</strong> {merchant?.business_name || ""}
          </p>
          <p>
            <strong>Email:</strong> {merchant?.email || ""}
          </p>
          <p>
            <strong>Phone:</strong> {merchant?.phone || ""}
          </p>
          <p>
            <strong>Plan:</strong> {merchant?.plan || ""}
          </p>
          <p>
            <strong>Status:</strong> {merchant?.onboarding_status || "new"}
          </p>
        </div>

        <div style={cardStyle}>
          <h2>Latest Ad Update</h2>
          {latestRequest ? (
            <>
              <p>
                <strong>Request:</strong> {latestRequest.promotion_title}
              </p>
              <p>
                <strong>Status:</strong> {latestRequest.status}
              </p>
              {latestRequest.admin_notes && (
                <p>
                  <strong>Note:</strong> {latestRequest.admin_notes}
                </p>
              )}
            </>
          ) : (
            <p>No ad requests submitted yet.</p>
          )}
        </div>

        <div style={cardStyle}>
          <h2>Connect Plate</h2>
          <p style={{ color: "#cbd5e1" }}>
            {plateSetup
              ? `Live page: /biz/${plateSetup.slug}`
              : "No Connect Plate setup yet."}
          </p>

          <a href="/connect-plate" style={yellowButton}>
            Start Setup
          </a>
          <a href="/edit-connect-plate" style={blueButton}>
            Edit Page
          </a>

          <QRCodeBlock slug={plateSetup?.slug} />
        </div>

        <div style={cardStyle}>
          <h2>Advertising</h2>
          <p style={{ color: "#cbd5e1" }}>
            Submit ad requests, upload images, review proofs, and approve
            designs.
          </p>

          <p style={highlightBox}>
            Requests Used This Month: {requestsUsed} / {monthlyLimit}
          </p>

          <p style={{ color: "#cbd5e1" }}>
            Remaining Included Requests:{" "}
            {Math.max(monthlyLimit - requestsUsed, 0)}
          </p>

          <a href="/ad-request" style={blueButton}>
            Submit Ad Request
          </a>

          <a
            href="/ad-timeline"
            style={{
              ...yellowButton,
              marginTop: "12px",
              display: "inline-block",
            }}
          >
            View Ad Timeline
          </a>
        </div>

        <div style={cardStyle}>
          <h2>Subscription</h2>
          <p>
            <strong>Square Customer ID:</strong>
          </p>
          <p style={smallText}>{merchant?.square_customer_id || ""}</p>

          <p>
            <strong>Subscription ID:</strong>
          </p>
          <p style={smallText}>{merchant?.square_subscription_id || ""}</p>
        </div>
      </div>
    </main>
  );
}

function formatHour(hour: string) {
  const numberHour = Number(hour);

  if (Number.isNaN(numberHour)) return "";

  const suffix = numberHour >= 12 ? "PM" : "AM";
  const displayHour = numberHour % 12 || 12;

  return `${displayHour}:00 ${suffix}`;
}

const pageStyle = {
  minHeight: "100vh",
  background: "#020b2d",
  color: "white",
  padding: "40px",
  fontFamily: "Arial",
};

const titleStyle = {
  fontSize: "52px",
  marginBottom: "12px",
};

const subtitleStyle = {
  color: "#cbd5e1",
  fontSize: "20px",
  marginBottom: "30px",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "16px",
  marginBottom: "30px",
};

const statCard = {
  background: "#1e293b",
  padding: "22px",
  borderRadius: "18px",
  border: "1px solid #334155",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "24px",
};

const cardStyle = {
  background: "#1e293b",
  borderRadius: "20px",
  padding: "28px",
};

const yellowButton = {
  display: "inline-block",
  background: "#facc15",
  color: "black",
  padding: "14px 24px",
  borderRadius: "12px",
  fontWeight: "bold" as const,
  textDecoration: "none",
  marginRight: "12px",
};

const blueButton = {
  display: "inline-block",
  background: "#38bdf8",
  color: "black",
  padding: "14px 24px",
  borderRadius: "12px",
  fontWeight: "bold" as const,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
};

const logoutButton = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "10px",
  fontWeight: "bold" as const,
  cursor: "pointer",
  marginBottom: "20px",
};

const highlightBox = {
  background: "#0f172a",
  padding: "14px",
  borderRadius: "12px",
  color: "#facc15",
  fontWeight: "bold" as const,
};

const insightText = {
  color: "#facc15",
  fontWeight: "bold" as const,
  marginTop: "14px",
};

const smallText = {
  color: "#cbd5e1",
  wordBreak: "break-all" as const,
};