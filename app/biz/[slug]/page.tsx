import { supabase } from "@/lib/supabase";
import LinkTracker from "./LinkTracker";

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: business } = await supabase
    .from("connect_plate_setups")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!business) {
    return (
      <main style={pageStyle}>
        <h1>Business Not Found</h1>
      </main>
    );
  }

  await supabase.from("connect_plate_scans").insert([
    {
      plate_id: business.id,
      user_id: business.user_id,
      slug: business.slug,
      source: "page_view",
    },
  ]);

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        {business.logo_url && (
          <img
            src={business.logo_url}
            alt={`${business.business_display_name} logo`}
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              borderRadius: "999px",
              marginBottom: "24px",
              background: "white",
            }}
          />
        )}

        <h1 style={titleStyle}>{business.business_display_name}</h1>

        <p style={messageStyle}>{business.featured_message}</p>

        <div style={buttonGrid}>
          {business.website && (
            <LinkTracker
              href={normalizeUrl(business.website)}
              linkType="website"
              business={business}
            >
              Visit Website
            </LinkTracker>
          )}

          {business.facebook && (
            <LinkTracker
              href={normalizeUrl(business.facebook)}
              linkType="facebook"
              business={business}
            >
              Facebook
            </LinkTracker>
          )}

          {business.instagram && (
            <LinkTracker
              href={normalizeUrl(business.instagram)}
              linkType="instagram"
              business={business}
            >
              Instagram
            </LinkTracker>
          )}

          {business.google_review_link && (
            <LinkTracker
              href={normalizeUrl(business.google_review_link)}
              linkType="google_review"
              business={business}
            >
              Leave A Review
            </LinkTracker>
          )}

          {business.phone && (
            <LinkTracker
              href={`tel:${business.phone}`}
              linkType="phone"
              business={business}
            >
              Call Business
            </LinkTracker>
          )}
        </div>

        <div style={footerStyle}>Powered by Hometown Perks</div>
      </div>
    </main>
  );
}

function normalizeUrl(url?: string) {
  if (!url) return "";

  const trimmed = url.trim();

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("tel:") ||
    trimmed.startsWith("mailto:")
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

const pageStyle = {
  minHeight: "100vh",
  background: "#020617",
  color: "white",
  padding: "40px",
  fontFamily: "Arial",
};

const cardStyle = {
  maxWidth: "700px",
  margin: "0 auto",
  background: "#1e293b",
  borderRadius: "24px",
  padding: "40px",
  textAlign: "center" as const,
};

const titleStyle = {
  fontSize: "48px",
  marginBottom: "12px",
};

const messageStyle = {
  color: "#cbd5e1",
  marginBottom: "32px",
  fontSize: "18px",
};

const buttonGrid = {
  display: "grid",
  gap: "16px",
};

const footerStyle = {
  marginTop: "40px",
  textAlign: "center" as const,
  color: "#94a3b8",
};