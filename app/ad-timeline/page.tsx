"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const timelineSteps = [
  "Request Submitted",
  "In Design",
  "Ready for Review",
  "Approved",
  "Scheduled",
  "Running",
];

export default function AdTimelinePage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadRequests() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please log in to view your ad timeline.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("ad_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setMessage("Could not load ad requests.");
      } else {
        setRequests(data || []);
      }

      setLoading(false);
    }

    loadRequests();
  }, []);

  async function approveDesign(id: string) {
    await supabase
      .from("ad_requests")
      .update({
        merchant_approval_status: "Approved",
        status: "Approved",
        approved_at: new Date().toISOString(),
      })
      .eq("id", id);

    await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "support@hometownperksusa.com",
        subject: "Ad Design Approved",
        message:
          "A merchant has approved their ad design in the Hometown Perks portal.",
      }),
    });

    window.location.reload();
  }

  async function requestChanges(id: string) {
    const feedback = prompt("What changes would you like made?");

    if (!feedback) return;

    await supabase
      .from("ad_requests")
      .update({
        merchant_approval_status: "Changes Requested",
        merchant_feedback: feedback,
        status: "Changes Requested",
      })
      .eq("id", id);

    await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "support@hometownperksusa.com",
        subject: "Merchant Requested Ad Changes",
        message: `A merchant requested changes to an ad design. Feedback: ${feedback}`,
      }),
    });

    window.location.reload();
  }

  if (loading) {
    return <main style={pageStyle}>Loading...</main>;
  }

  return (
    <main style={pageStyle}>
      <h1 style={{ fontSize: "48px" }}>Ad Design Timeline</h1>

      <p style={{ color: "#cbd5e1", fontSize: "18px" }}>
        Track the progress of your submitted ad requests.
      </p>

      {message && <p style={{ color: "#facc15" }}>{message}</p>}

      <div style={{ display: "grid", gap: "24px", marginTop: "32px" }}>
        {requests.map((request) => {
          const hasPreview = !!request.preview_url;

          return (
            <div key={request.id} style={cardStyle}>
              <h2>{request.promotion_title || "Ad Request"}</h2>

              <p style={{ color: "#cbd5e1" }}>
                {request.promotion_details}
              </p>

              <div style={{ marginTop: "16px" }}>
                <strong>Project Progress</strong>

                <div style={timelineWrapper}>
                  {timelineSteps.map((step, index) => {
                    const active =
                      timelineSteps.indexOf(request.status) >= index;

                    return (
                      <div
                        key={step}
                        style={{
                          ...timelineStep,
                          background: active ? "#22c55e" : "#334155",
                        }}
                      >
                        {step}
                      </div>
                    );
                  })}
                </div>

                <div
                  style={{
                    marginTop: "16px",
                    display: "inline-block",
                    background:
                      request.status === "Approved"
                        ? "#16a34a"
                        : request.status === "Changes Requested"
                        ? "#dc2626"
                        : "#2563eb",
                    padding: "10px 16px",
                    borderRadius: "999px",
                    fontWeight: "bold",
                  }}
                >
                  {request.status}
                </div>
              </div>

              {request.uploaded_files &&
                request.uploaded_files.length > 0 && (
                  <div style={{ marginTop: "20px" }}>
                    <strong>Files You Uploaded</strong>

                    <div style={imageGrid}>
                      {request.uploaded_files.map((fileUrl: string) => (
                        <a
                          key={fileUrl}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={fileUrl}
                            alt="Uploaded file"
                            style={imageStyle}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              {request.admin_notes && (
                <div style={noteBox}>
                  <strong>Update From Hometown Perks</strong>

                  <p style={{ marginTop: "10px", color: "#cbd5e1" }}>
                    {request.admin_notes}
                  </p>
                </div>
              )}

              {hasPreview ? (
                <div style={{ marginTop: "20px" }}>
                  <strong>Ad Preview Ready For Review:</strong>

                  <br />

                  <img
                    src={request.preview_url}
                    alt="Ad Preview"
                    style={{
                      marginTop: "12px",
                      maxWidth: "100%",
                      borderRadius: "16px",
                    }}
                  />

                  {request.status !== "Approved" && (
                    <div style={buttonRow}>
                      <button
                        onClick={() => approveDesign(request.id)}
                        style={approveButton}
                      >
                        Approve Design
                      </button>

                      <button
                        onClick={() => requestChanges(request.id)}
                        style={changesButton}
                      >
                        Request Changes
                      </button>
                    </div>
                  )}

                  {request.status === "Approved" && (
                    <p style={approvedMessage}>
                      ✅ This design has been approved.
                    </p>
                  )}
                </div>
              ) : (
                <div style={waitingBox}>
                  <strong>Ad Preview Not Ready Yet</strong>

                  <p style={{ marginTop: "8px", color: "#cbd5e1" }}>
                    Hometown Perks is still preparing your ad proof. Once it is
                    uploaded, approval buttons will appear here.
                  </p>
                </div>
              )}

              {request.merchant_feedback && (
                <div style={feedbackStyle}>
                  <strong>Merchant Feedback:</strong>
                  <p>{request.merchant_feedback}</p>
                </div>
              )}
            </div>
          );
        })}

        {requests.length === 0 && (
          <div style={cardStyle}>
            <p>No ad requests found yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#020b2d",
  color: "white",
  padding: "40px",
  fontFamily: "Arial",
};

const cardStyle = {
  background: "#1e293b",
  padding: "28px",
  borderRadius: "20px",
  maxWidth: "850px",
};

const imageGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "12px",
  marginTop: "12px",
};

const imageStyle = {
  width: "100%",
  borderRadius: "12px",
  background: "white",
};

const noteBox = {
  marginTop: "20px",
  background: "#0f172a",
  padding: "16px",
  borderRadius: "12px",
  border: "1px solid #334155",
};

const waitingBox = {
  marginTop: "20px",
  background: "#0f172a",
  padding: "16px",
  borderRadius: "12px",
  border: "1px solid #334155",
};

const buttonRow = {
  display: "flex",
  gap: "12px",
  marginTop: "20px",
  flexWrap: "wrap" as const,
};

const approveButton = {
  background: "#22c55e",
  color: "white",
  border: "none",
  padding: "14px 20px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "bold" as const,
};

const changesButton = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "14px 20px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "bold" as const,
};

const approvedMessage = {
  marginTop: "16px",
  color: "#22c55e",
  fontWeight: "bold" as const,
};

const feedbackStyle = {
  marginTop: "20px",
  background: "#0f172a",
  padding: "16px",
  borderRadius: "12px",
  color: "#facc15",
};

const timelineWrapper = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: "10px",
  marginTop: "14px",
};

const timelineStep = {
  padding: "10px 14px",
  borderRadius: "999px",
  color: "white",
  fontSize: "14px",
  fontWeight: "bold" as const,
};