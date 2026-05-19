"use client";

import { supabase } from "@/lib/supabase";

export default function LinkTracker({
  href,
  linkType,
  business,
  children,
}: {
  href: string;
  linkType: string;
  business: any;
  children: React.ReactNode;
}) {
  async function trackClick() {
    await supabase.from("connect_plate_link_clicks").insert([
      {
        plate_id: business.id,
        user_id: business.user_id,
        slug: business.slug,
        link_type: linkType,
      },
    ]);
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