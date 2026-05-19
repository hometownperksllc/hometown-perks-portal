"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ConnectPlatePage() {
  const [form, setForm] = useState({
    business_name: "",
    website: "",
    facebook: "",
    instagram: "",
    google_review_link: "",
    phone: "",
    featured_message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
 const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  alert("Please log in before submitting your Connect Plate setup.");
  return;
}
    let logoUrl = "";

if (logoFile) {
  const fileName = `${Date.now()}-${logoFile.name}`;

  const { error: uploadError } = await supabase.storage
    .from("business-logos")
    .upload(fileName, logoFile);

  if (!uploadError) {
    const { data } = supabase.storage
      .from("business-logos")
      .getPublicUrl(fileName);

    logoUrl = data.publicUrl;
  }
}

const slug = form.business_name
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s-]/g, "")
  .replace(/\s+/g, "-")
  .replace(/-+/g, "-");

const existing = await supabase
  .from("connect_plate_setups")
  .select("id")
  .eq("user_id", user.id)
  .limit(1);

let error = null;

if (existing.data && existing.data.length > 0) {
  const result = await supabase
    .from("connect_plate_setups")
    .update({
      business_display_name: form.business_name,
      slug,
      website: form.website,
      facebook: form.facebook,
      instagram: form.instagram,
      google_review_link: form.google_review_link,
      phone: form.phone,
      featured_message: form.featured_message,
      logo_url: logoUrl,
    })
    .eq("user_id", user.id);

  error = result.error;
} else {
  const result = await supabase
    .from("connect_plate_setups")
    .insert([
      {
        user_id: user.id,
        business_display_name: form.business_name,
        slug,
        website: form.website,
        facebook: form.facebook,
        instagram: form.instagram,
        google_review_link: form.google_review_link,
        phone: form.phone,
        featured_message: form.featured_message,
        logo_url: logoUrl,
      },
    ]);

  error = result.error;
}

    if (!error) {
      setSubmitted(true);
    } else {
      alert("Something went wrong.");
      console.error(error);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #334155",
    background: "#1e293b",
    color: "white",
    fontSize: "16px",
  };

  const buttonStyle = {
    background: "#facc15",
    color: "#000",
    border: "none",
    padding: "16px",
    borderRadius: "12px",
    fontWeight: "bold" as const,
    fontSize: "16px",
    cursor: "pointer",
  };

  if (submitted) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#020617",
          color: "white",
          padding: "40px",
          fontFamily: "Arial",
        }}
      >
        <h1>Connect Plate Setup Submitted</h1>

        <p style={{ color: "#cbd5e1", marginTop: "16px" }}>
          Your Connect Plate information has been received successfully.
        </p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ fontSize: "48px", marginBottom: "12px" }}>
        Connect Plate Setup
      </h1>

      <p style={{ color: "#cbd5e1", marginBottom: "40px" }}>
        Submit your business information for your Connect Plate landing page.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "18px",
          maxWidth: "700px",
        }}
      >
        <input
          placeholder="Business Name"
          style={inputStyle}
          value={form.business_name}
          onChange={(e) =>
            setForm({ ...form, business_name: e.target.value })
          }
        />

        <input
          placeholder="Website URL"
          style={inputStyle}
          value={form.website}
          onChange={(e) =>
            setForm({ ...form, website: e.target.value })
          }
        />

        <input
          placeholder="Facebook Link"
          style={inputStyle}
          value={form.facebook}
          onChange={(e) =>
            setForm({ ...form, facebook: e.target.value })
          }
        />

        <input
          placeholder="Instagram Link"
          style={inputStyle}
          value={form.instagram}
          onChange={(e) =>
            setForm({ ...form, instagram: e.target.value })
          }
        />

        <input
          placeholder="Google Review Link"
          style={inputStyle}
          value={form.google_review_link}
          onChange={(e) =>
            setForm({
              ...form,
              google_review_link: e.target.value,
            })
          }
        />

        <input
          placeholder="Phone Number"
          style={inputStyle}
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
        />

        <textarea
          placeholder="Featured Message"
          rows={5}
          style={inputStyle}
          value={form.featured_message}
          onChange={(e) =>
            setForm({
              ...form,
              featured_message: e.target.value,
            })
          }
        />
        <input
  type="file"
  accept="image/*"
  onChange={(e) =>
    setLogoFile(e.target.files?.[0] || null)
  }
  style={inputStyle}
/>

        <button type="submit" style={buttonStyle}>
          Submit Setup
        </button>
      </form>
    </main>
  );
}