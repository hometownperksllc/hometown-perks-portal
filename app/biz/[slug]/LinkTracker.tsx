"use client";



export default function LinkTracker({
  href,
  linkType,
  business,
  children,
}: {
  href: string;
  linkType: string;
  business: { id: string; slug: string };
  children: React.ReactNode;
}) {
  async function trackClick() {
    await fetch('/api/connect-plate/track', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: business.slug, linkType }), keepalive: true,
    });
  }

  return (
    <a
      href={href}
      onClick={trackClick}
      style={buttonStyle}
      target={href.startsWith("tel:") ? undefined : "_blank"}
      rel={href.startsWith("tel:") ? undefined : "noopener noreferrer"}
    >
      {children}
    </a>
  );
}

const buttonStyle = {
  display: "block",
  background: "#facc15",
  color: "black",
  padding: "16px",
  borderRadius: "14px",
  textDecoration: "none",
  fontWeight: "bold",
  textAlign: "center" as const,
};