"use client";

import { QRCodeCanvas } from "qrcode.react";

export default function QRCodeBlock({ slug }: { slug?: string }) {
  if (!slug) return null;

  const baseUrl = "http://192.168.40.133:3000";

  const url = `${baseUrl}/biz/${slug}`;

  return (
    <div
      style={{
        marginTop: "24px",
        background: "white",
        padding: "16px",
        borderRadius: "16px",
        width: "fit-content",
        boxShadow: "0 0 20px rgba(0,0,0,0.25)",
      }}
    >
      <QRCodeCanvas value={url} size={180} />

      <p
        style={{
          marginTop: "12px",
          color: "black",
          fontWeight: "bold",
          textAlign: "center",
          fontSize: "16px",
        }}
      >
        Scan Connect Plate
      </p>

      <p
        style={{
          marginTop: "6px",
          color: "#475569",
          textAlign: "center",
          fontSize: "12px",
          wordBreak: "break-all",
          maxWidth: "180px",
        }}
      >
        {url}
      </p>
    </div>
  );
}