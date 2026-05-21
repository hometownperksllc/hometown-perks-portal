"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdRequestPage() {
  const [businessName, setBusinessName] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {
    async function loadMerchant() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.email) return;

      const { data } = await supabase
        .from("merchants")
        .select("business_name")
        .eq("email", session.user.email)
        .single();

      if (data?.business_name) {
        setBusinessName(data.business_name);
      }
    }

    loadMerchant();
  }, []);

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

    let uploadedFiles: string[] = [];

    if (files && files.length > 0) {
      for (const file of Array.from(files)) {
        const fileName = `${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("ad-uploads")
          .upload(fileName, file);

        if (!uploadError) {
          uploadedFiles.push(fileName);
        }
      }
    }

    const { error } = await supabase.from("ad_requests").insert([
      {
        business_name: businessName,
        notes: notes,
        email: session.user.email,
        status: "Submitted",
        uploaded_files: uploadedFiles,
      },
    ]);

    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Ad request submitted successfully.");
      setNotes("");
      setFiles(null);
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
          maxWidth: "900px",
          margin: "0 auto",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "30px",
          padding: "50px",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 25px 80px rgba(0,0,0,.35)",
        }}
      >
        <div
          style={{
            color: "#60a5fa",
            letterSpacing: "2px",
            textTransform: "uppercase",
            fontWeight: 700,
            marginBottom: "12px",
          }}
        >
          Merchant Portal
        </div>

        <h1
          style={{
            fontSize: "58px",
            marginTop: 0,
            marginBottom: "10px",
            fontWeight: 800,
          }}
        >
          Submit Ad Request
        </h1>

        <p
          style={{
            color: "#c7d2fe",
            marginBottom: "40px",
            fontSize: "18px",
            lineHeight: 1.6,
          }}
        >
          Upload photos, logos, specials, or information you want included in
          your TV advertising slide.
        </p>

        <form
          onSubmit={submitRequest}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div>
            <label style={labelStyle}>Business Name</label>

            <input
              value={businessName}
              readOnly
              style={{
                ...inputStyle,
                opacity: 0.9,
                cursor: "not-allowed",
              }}
            />
          </div>

<div>
  <label style={labelStyle}>Upload Images or Videos</label>

  <label
    htmlFor="file-upload"
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      width: "100%",
      padding: "22px",
      borderRadius: "20px",
      border: "2px dashed rgba(96,165,250,0.45)",
      background: "rgba(255,255,255,0.04)",
      cursor: "pointer",
      transition: "0.2s ease",
      color: "#dbeafe",
      fontWeight: 600,
      fontSize: "16px",
    }}
  >
    📁 Click to Upload Files
  </label>

  <input
    id="file-upload"
    type="file"
    multiple
    accept=".jpg,.jpeg,.png,.gif,.bmp,.mp4"
    onChange={(e) => {
      const selectedFiles = e.target.files;

      if (!selectedFiles) return;

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/bmp",
        "video/mp4",
      ];

      const validFiles = Array.from(selectedFiles).filter((file) =>
        allowedTypes.includes(file.type)
      );

      if (validFiles.length !== selectedFiles.length) {
        alert(
          "Only JPG, PNG, GIF, BMP images and MP4 videos are allowed."
        );
      }

      const dataTransfer = new DataTransfer();

      validFiles.forEach((file) => {
        dataTransfer.items.add(file);
      });

      setFiles(dataTransfer.files);
    }}
    style={{
      display: "none",
    }}
  />

  {files && files.length > 0 && (
    <div
      style={{
        marginTop: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {Array.from(files).map((file, index) => (
        <div
          key={index}
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "12px 16px",
            borderRadius: "14px",
            color: "#c7d2fe",
            fontSize: "14px",
          }}
        >
          ✅ {file.name}
        </div>
      ))}
    </div>
  )}

  <p
    style={{
      color: "#93c5fd",
      fontSize: "14px",
      marginTop: "14px",
      opacity: 0.85,
      lineHeight: 1.5,
    }}
  >
    Supported files: JPG, PNG, GIF, BMP images and MP4 videos.
    Multiple uploads are allowed.
  </p>
</div>

          <div>
            <label style={labelStyle}>Advertisement Instructions</label>

            <textarea
              placeholder="Example: Please promote our Mother’s Day flower arrangements and mention free delivery this weekend..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={8}
              style={{
                ...inputStyle,
                resize: "vertical",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background:
                "linear-gradient(135deg,#2563eb 0%,#3b82f6 100%)",
              border: "none",
              color: "white",
              padding: "20px",
              borderRadius: "18px",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "18px",
              boxShadow: "0 12px 30px rgba(37,99,235,.35)",
            }}
          >
            {loading ? "Submitting..." : "Submit Advertisement Request"}
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

const labelStyle = {
  display: "block",
  marginBottom: "10px",
  fontWeight: 600,
  color: "#dbeafe",
};

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