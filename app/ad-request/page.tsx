"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdRequestPage() {
  const [form, setForm] = useState({
    business_name: "",
    promotion_title: "",
    promotion_details: "",
    preferred_wording: "",
    start_date: "",
    end_date: "",
    images_notes: "",
  });

  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please log in before submitting an ad request.");
      return;
    }

    const currentMonth = new Date().toISOString().slice(0, 7);

    const { data: merchants } = await supabase
      .from("merchants")
      .select("plan")
      .eq("user_id", user.id)
      .limit(1);

    const plan = merchants?.[0]?.plan || "";

    const monthlyLimit =
      plan === "premier" || plan === "Founding Premier Partner" ? 3 : 1;

    const { data: existingRequests } = await supabase
      .from("ad_requests")
      .select("id")
      .eq("user_id", user.id)
      .eq("request_month", currentMonth)
      .eq("is_extra_paid", false);

    const usedRequests = existingRequests?.length || 0;

    if (usedRequests >= monthlyLimit) {
      setMessage(
        `You have used your included ${monthlyLimit} ad request(s) for this month. Additional requests require a paid add-on.`
      );
      return;
    }

    let uploadedUrls: string[] = [];

    if (files && files.length > 0) {
      for (const file of Array.from(files)) {
        const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const filePath = `${user.id}/${Date.now()}-${safeFileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("ad-request-files")
          .upload(filePath, file);

        console.log("UPLOAD RESULT:", uploadData);
        console.log("UPLOAD ERROR:", uploadError);

        if (uploadError) {
          console.error(uploadError);
          setMessage(`File upload failed: ${uploadError.message}`);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("ad-request-files").getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }
    }

    const { error } = await supabase.from("ad_requests").insert([
      {
        user_id: user.id,
        business_name: form.business_name,
        promotion_title: form.promotion_title,
        promotion_details: form.promotion_details,
        preferred_wording: form.preferred_wording,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        images_notes: form.images_notes,
        request_month: currentMonth,
        is_extra_paid: false,
        uploaded_files: uploadedUrls,
      },
    ]);

    if (error) {
      console.error(error);
      setMessage(`Something went wrong: ${error.message}`);
    } else {
      setMessage("Ad request submitted successfully!");
      setFiles(null);
      setForm({
        business_name: "",
        promotion_title: "",
        promotion_details: "",
        preferred_wording: "",
        start_date: "",
        end_date: "",
        images_notes: "",
      });
    }
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <h1>Submit Ad Request</h1>

        <p style={{ color: "#cbd5e1" }}>
          Tell us what you want promoted. We’ll design the ad and move it through
          the approval timeline.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: "16px",
            marginTop: "24px",
          }}
        >
          <input
            placeholder="Business Name"
            style={inputStyle}
            value={form.business_name}
            onChange={(e) =>
              setForm({
                ...form,
                business_name: e.target.value,
              })
            }
          />

          <input
            placeholder="Promotion Title"
            style={inputStyle}
            value={form.promotion_title}
            onChange={(e) =>
              setForm({
                ...form,
                promotion_title: e.target.value,
              })
            }
          />

          <textarea
            placeholder="Promotion Details"
            rows={5}
            style={inputStyle}
            value={form.promotion_details}
            onChange={(e) =>
              setForm({
                ...form,
                promotion_details: e.target.value,
              })
            }
          />

          <textarea
            placeholder="Preferred Wording"
            rows={4}
            style={inputStyle}
            value={form.preferred_wording}
            onChange={(e) =>
              setForm({
                ...form,
                preferred_wording: e.target.value,
              })
            }
          />

          <input
            type="date"
            style={inputStyle}
            value={form.start_date}
            onChange={(e) =>
              setForm({
                ...form,
                start_date: e.target.value,
              })
            }
          />

          <input
            type="date"
            style={inputStyle}
            value={form.end_date}
            onChange={(e) =>
              setForm({
                ...form,
                end_date: e.target.value,
              })
            }
          />

          <textarea
            placeholder="Image/Product Notes"
            rows={4}
            style={inputStyle}
            value={form.images_notes}
            onChange={(e) =>
              setForm({
                ...form,
                images_notes: e.target.value,
              })
            }
          />

          <div>
            <strong>Upload Images or Logos</strong>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(e.target.files)}
              style={{
                marginTop: "12px",
                color: "white",
              }}
            />
          </div>

          <button type="submit" style={buttonStyle}>
            Submit Ad Request
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "20px",
              color: "#facc15",
            }}
          >
            {message}
          </p>
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
  maxWidth: "760px",
  margin: "0 auto",
  background: "#1e293b",
  padding: "32px",
  borderRadius: "24px",
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #334155",
  background: "#0f172a",
  color: "white",
  fontSize: "16px",
};

const buttonStyle = {
  background: "#facc15",
  color: "black",
  border: "none",
  padding: "16px",
  borderRadius: "12px",
  fontWeight: "bold" as const,
  fontSize: "16px",
  cursor: "pointer",
};