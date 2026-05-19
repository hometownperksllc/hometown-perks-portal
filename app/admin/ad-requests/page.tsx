"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const statuses = [
  "Request Submitted",
  "Info Received",
  "In Design",
  "Ready for Review",
  "Changes Requested",
  "Approved",
  "Scheduled",
  "Running",
];

export default function AdminAdRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function loadRequests() {
    const { data } = await supabase
      .from("ad_requests")
      .select("*")
      .order("created_at", { ascending: false });

    setRequests(data || []);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("ad_requests").update({ status }).eq("id", id);
    loadRequests();
  }

  async function updateAdminNote(id: string) {
    await supabase
      .from("ad_requests")
      .update({
        admin_notes: notes[id],
      })
      .eq("id", id);

    loadRequests();
  }

  async function uploadPreview(
    e: React.ChangeEvent<HTMLInputElement>,
    requestId: string
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    const filePath = `${requestId}-${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("ad-previews")
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("ad-previews").getPublicUrl(filePath);

    await supabase
      .from("ad_requests")
      .update({
        preview_url: publicUrl,
        status: "Ready for Review",
      })
      .eq("id", requestId);

    const request = requests.find((r) => r.id === requestId);

    const { data: merchantData } = await supabase
      .from("merchants")
      .select("email")
      .eq("user_id", request?.user_id)
      .limit(1);

    const merchantEmail = merchantData?.[0]?.email;

    if (merchantEmail) {
      await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: merchantEmail,
          subject: "Your Hometown Perks Ad Preview Is Ready",
          message: `
            Your advertisement preview is now ready for review.

            Please log in to your merchant dashboard to approve the design or request changes.

            Thank you for using Hometown Perks.
          `,
        }),
      });
    }

    loadRequests();
  }

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <main style={pageStyle}>
      <h1>Admin Ad Requests</h1>

      <div style={statsGrid}>
        {statuses.map((status) => {
          const count = requests.filter((r) => r.status === status).length;

          return (
            <div key={status} style={statCard}>
              <div style={{ color: "#cbd5e1", fontSize: "14px" }}>
                {status}
              </div>

              <div style={{ fontSize: "32px", fontWeight: "bold" }}>
                {count}
              </div>
            </div>
          );
        })}
      </div>

      {requests.map((request) => (
        <div key={request.id} style={cardStyle}>
          <h2>{request.promotion_title}</h2>

          <p>
            <strong>Business:</strong> {request.business_name}
          </p>

          <p>
            <strong>Details:</strong> {request.promotion_details}
          </p>

          {request.uploaded_files && request.uploaded_files.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <strong>Merchant Uploaded Files</strong>

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
                      alt="Merchant uploaded file"
                      style={imageStyle}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          <p>
            <strong>Current Status:</strong> {request.status}
          </p>

          {request.merchant_approval_status && (
            <div
              style={{
                marginTop: "14px",
                padding: "12px",
                borderRadius: "12px",
                background:
                  request.merchant_approval_status === "Approved"
                    ? "#14532d"
                    : "#7f1d1d",
                color: "white",
                fontWeight: "bold",
              }}
            >
              Merchant Response: {request.merchant_approval_status}
            </div>
          )}

          {request.merchant_feedback && (
            <div style={messageBox}>
              <strong>Merchant Requested Changes:</strong>

              <p style={{ marginTop: "10px", color: "#cbd5e1" }}>
                {request.merchant_feedback}
              </p>
            </div>
          )}

          <select
            value={request.status}
            onChange={(e) => updateStatus(request.id, e.target.value)}
            style={inputStyle}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <div style={{ marginTop: "20px" }}>
            <strong>Upload Ad Preview</strong>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => uploadPreview(e, request.id)}
              style={{
                marginTop: "10px",
                display: "block",
              }}
            />
          </div>

          <div style={{ marginTop: "16px" }}>
            <strong>Admin Notes</strong>

            <textarea
              placeholder="Add update or message for merchant..."
              value={notes[request.id] || request.admin_notes || ""}
              onChange={(e) =>
                setNotes({
                  ...notes,
                  [request.id]: e.target.value,
                })
              }
              style={inputStyle}
              rows={4}
            />

            <button
              onClick={() => updateAdminNote(request.id)}
              style={buttonStyle}
            >
              Save Note
            </button>
          </div>

          {request.preview_url && (
            <div style={{ marginTop: "20px" }}>
              <strong>Current Ad Preview</strong>

              <img
                src={request.preview_url}
                alt="Preview"
                style={{
                  marginTop: "12px",
                  maxWidth: "100%",
                  borderRadius: "16px",
                }}
              />
            </div>
          )}
        </div>
      ))}
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

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "16px",
  marginBottom: "30px",
};

const statCard = {
  background: "#1e293b",
  padding: "18px",
  borderRadius: "14px",
  border: "1px solid #334155",
};

const cardStyle = {
  background: "#1e293b",
  padding: "24px",
  borderRadius: "16px",
  marginBottom: "20px",
};

const imageGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "14px",
  marginTop: "12px",
};

const imageStyle = {
  width: "100%",
  borderRadius: "12px",
  background: "white",
};

const messageBox = {
  marginTop: "14px",
  background: "#0f172a",
  padding: "16px",
  borderRadius: "12px",
  border: "1px solid #334155",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  marginTop: "12px",
};

const buttonStyle = {
  marginTop: "12px",
  background: "#facc15",
  color: "black",
  border: "none",
  padding: "12px 18px",
  borderRadius: "10px",
  fontWeight: "bold" as const,
  cursor: "pointer",
};