export default function SuccessPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ fontSize: "48px", marginBottom: "16px" }}>
        You're officially signed up!
      </h1>

      <p style={{ fontSize: "22px", color: "#cbd5e1", maxWidth: "700px" }}>
        Thank you for becoming a Hometown Perks partner. Your information has
        been received, your payment method was securely saved, and your monthly
        membership has been created.
      </p>

      <div
        style={{
          marginTop: "32px",
          background: "#1e293b",
          padding: "24px",
          borderRadius: "16px",
          maxWidth: "700px",
        }}
      >
        <h2>What happens next?</h2>
        <p style={{ color: "#cbd5e1" }}>
          We’ll review your business details, prepare your partner profile, and
          reach out if we need anything else for your ads or Connect Plate setup.
        </p>
      </div>
      <div
  style={{
    marginTop: "24px",
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  }}
>
  <a
    href="/dashboard"
    style={{
      background: "#facc15",
      color: "#000",
      padding: "14px 22px",
      borderRadius: "12px",
      fontWeight: "bold",
      textDecoration: "none",
    }}
  >
    Go To Dashboard
  </a>

  <a
    href="/"
    style={{
      background: "#334155",
      color: "white",
      padding: "14px 22px",
      borderRadius: "12px",
      textDecoration: "none",
    }}
  >
    Return Home
  </a>
</div>
<div
  style={{
    marginTop: "32px",
    background: "#111827",
    padding: "24px",
    borderRadius: "16px",
    maxWidth: "700px",
  }}
>
  <h2>Onboarding Progress</h2>

  <div style={{ marginTop: "16px", lineHeight: "2" }}>
    <div>✅ Subscription Activated</div>
    <div>✅ Payment Method Saved</div>
    <div>✅ Merchant Account Created</div>
    <div>⏳ Connect Plate Setup</div>
    <div>⏳ Ad Approval & Launch</div>
  </div>
</div>
    </main>
  );
}