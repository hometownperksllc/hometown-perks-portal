"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EditConnectPlatePage() {
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    id: "",
    business_display_name: "",
    website: "",
    facebook: "",
    instagram: "",
    google_review_link: "",
    phone: "",
    featured_message: "",
    slug: "",
  });

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from("connect_plate_setups")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      const setup = data?.[0];

      if (setup) {
        setForm(setup);
      }

      setLoading(false);
    }

    loadData();
  }, []);

  async function handleSave() {
    const response = await fetch("/api/update-connect-plate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const result = await response.json();

    if (result.success) {
      alert("Saved successfully!");
    } else {
      alert("Something went wrong.");
    }
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#020617",
          color: "white",
          padding: "40px",
        }}
      >
        Loading...
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
      <h1 style={{ fontSize: "44px", marginBottom: "30px" }}>
        Edit Connect Plate
      </h1>

      <div
        style={{
          background: "#1e293b",
          padding: "24px",
          borderRadius: "16px",
          maxWidth: "700px",
        }}
      >
        <input
          value={form.website}
          onChange={(e) =>
            setForm({ ...form, website: e.target.value })
          }
          placeholder="Website"
          style={inputStyle}
        />

        <input
          value={form.facebook}
          onChange={(e) =>
            setForm({ ...form, facebook: e.target.value })
          }
          placeholder="Facebook"
          style={inputStyle}
        />

        <input
          value={form.instagram}
          onChange={(e) =>
            setForm({ ...form, instagram: e.target.value })
          }
          placeholder="Instagram"
          style={inputStyle}
        />

        <input
          value={form.google_review_link}
          onChange={(e) =>
            setForm({
              ...form,
              google_review_link: e.target.value,
            })
          }
          placeholder="Google Review Link"
          style={inputStyle}
        />

        <input
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
          placeholder="Phone"
          style={inputStyle}
        />

        <textarea
          value={form.featured_message}
          onChange={(e) =>
            setForm({
              ...form,
              featured_message: e.target.value,
            })
          }
          placeholder="Featured Message"
          style={{
            ...inputStyle,
            minHeight: "120px",
          }}
        />

        <button
          onClick={handleSave}
          style={{
            background: "#facc15",
            color: "black",
            border: "none",
            padding: "16px",
            borderRadius: "12px",
            fontWeight: "bold",
            width: "100%",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Save Changes
        </button>

        <a
          href={`/biz/${form.slug}`}
          target="_blank"
          style={{
            display: "block",
            marginTop: "20px",
            textAlign: "center",
            color: "#38bdf8",
          }}
        >
          View Live Page
        </a>
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "16px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#0f172a",
  color: "white",
  fontSize: "16px",
};