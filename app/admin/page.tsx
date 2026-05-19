import { supabase } from "@/lib/supabase";

export default async function AdminPage() {
  const { data: merchants } = await supabase
    .from("merchants")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: connectPlates } = await supabase
    .from("connect_plate_setups")
    .select("*")
    .order("created_at", { ascending: false });

  const cardStyle = {
    background: "#1e293b",
    padding: "24px",
    borderRadius: "16px",
    marginBottom: "24px",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#020b2d",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ fontSize: "48px", marginBottom: "40px" }}>
        Hometown Perks Admin
      </h1>

      <h2>Merchants</h2>

      {merchants?.map((merchant) => (
        <div key={merchant.id} style={cardStyle}>
          <h3>{merchant.business_name}</h3>

          <p>
            <strong>Contact:</strong> {merchant.contact_name}
          </p>

          <p>
            <strong>Email:</strong> {merchant.email}
          </p>

          <p>
            <strong>Phone:</strong> {merchant.phone}
          </p>

          <p>
            <strong>Plan:</strong> {merchant.plan}
          </p>

          <p>
            <strong>Status:</strong> {merchant.onboarding_status}
          </p>

          <p>
            <strong>Square Customer ID:</strong>{" "}
            {merchant.square_customer_id}
          </p>

          <p>
            <strong>Subscription ID:</strong>{" "}
            {merchant.square_subscription_id}
          </p>
        </div>
      ))}

      <h2 style={{ marginTop: "60px" }}>
        Connect Plate Submissions
      </h2>

      {connectPlates?.map((plate) => (
        <div key={plate.id} style={cardStyle}>
          <h3>{plate.business_display_name}</h3>

          <p>
            <strong>Website:</strong> {plate.website}
          </p>

          <p>
            <strong>Facebook:</strong> {plate.facebook}
          </p>

          <p>
            <strong>Instagram:</strong> {plate.instagram}
          </p>

          <p>
            <strong>Phone:</strong> {plate.phone}
          </p>

          <p>
            <strong>Google Review:</strong>{" "}
            {plate.google_review_link}
          </p>

          <p>
            <strong>Featured Message:</strong>
          </p>

          <div
            style={{
              background: "#0f172a",
              padding: "16px",
              borderRadius: "12px",
            }}
          >
            {plate.featured_message}
          </div>
        </div>
      ))}
    </main>
  );
}
