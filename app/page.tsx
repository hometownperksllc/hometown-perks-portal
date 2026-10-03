const plans = [{
  name: "Founding Advertiser",
  price: "$149/mo",
  description: "Planned launch package. Billing starts when your ad goes live.",
  features: ["Advertising across the initial participating locations", "Screen installations are not yet complete", "Ad details and service terms confirmed before commitment", "Connect Plate available as an optional add-on"],
}];

export default function Home() {
  return (
    <main style={pageStyle}>
      <section style={navStyle}>
        <h2 style={{ margin: 0 }}>Hometown Perks</h2>

        <div style={navLinks}>
          <a href="#how" style={navLink}>How It Works</a>
          <a href="#plans" style={navLink}>Plans</a>
          <a href="/login" style={navButton}>Merchant Login</a>
        </div>
      </section>

      <section style={heroStyle}>
        <div>
          <p style={eyebrow}>Local Visibility Platform</p>

          <h1 style={heroTitle}>
            Helping local businesses get seen, remembered, and supported.
          </h1>

          <p style={heroText}>
            Our local advertising network is preparing to launch. Five to six businesses have expressed interest in hosting screens; installations are not yet complete. Register your interest in advertising, with optional QR/NFC Connect Plate services.
          </p>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <a href="#plans" style={primaryButton}>
              View Launch Offer
            </a>

            <a href="https://www.hometownperksusa.com/merchant-signup" style={secondaryButton}>
              Become a Founding Advertiser
            </a>
          </div>
        </div>

        <div style={heroCard}>
          <p style={cardEyebrow}>Platform Includes</p>
          <h2 style={{ fontSize: "38px", marginTop: 0 }}>Built for local growth</h2>

          <div style={miniGrid}>
            <div style={miniCard}>
              <strong>TV Ads</strong>
              <span>Screen visibility</span>
            </div>
            <div style={miniCard}>
              <strong>QR/NFC</strong>
              <span>Connect Plate</span>
            </div>
            <div style={miniCard}>
              <strong>Portal</strong>
              <span>Merchant tools</span>
            </div>
            <div style={miniCard}>
              <strong>Insights</strong>
              <span>Scan tracking</span>
            </div>
          </div>
        </div>
      </section>

      <section id="how" style={sectionStyle}>
        <p style={eyebrow}>How It Works</p>
        <h2 style={sectionTitle}>Simple onboarding. Real visibility.</h2>

        <div style={stepsGrid}>
          {[
            "Register your interest",
            "Submit your business details",
            "Upload or request your ad",
            "Go live when screens are ready",
          ].map((step, i) => (
            <div key={step} style={glassCard}>
              <p style={stepNumber}>Step {i + 1}</p>
              <h3>{step}</h3>
            </div>
          ))}
        </div>
      </section>

      <section id="plans" style={sectionStyle}>
        <p style={eyebrow}>Founding Advertiser Launch Offer</p>
        <h2 style={sectionTitle}>One planned package. $149 per month.</h2>

        <div style={plansGrid}>
          {plans.map((plan) => (
            <div key={plan.name} style={pricingCard}>
              <h3 style={{ fontSize: "28px", marginTop: 0 }}>{plan.name}</h3>
              <p style={mutedText}>{plan.description}</p>

              <div style={priceStyle}>{plan.price}</div>

              <ul style={{ paddingLeft: "20px", color: "#dbeafe", lineHeight: 1.8 }}>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <a href="https://www.hometownperksusa.com/merchant-signup" style={primaryButton}>
                Become a Founding Advertiser
              </a>
            </div>
          ))}
        </div>
      </section>

      <section style={featureBand}>
        <div>
          <p style={eyebrow}>Connect Plate</p>
          <h2 style={sectionTitle}>QR + NFC customer engagement tools.</h2>

          <p style={heroText}>
            Connect customers to reviews, social links, menus, websites,
            offers, and custom mobile landing pages with one simple countertop
            plate.
          </p>
        </div>

        <div style={priceBadge}>
          <span>Optional add-on</span>
          <strong>Ask about current pricing</strong>
        </div>
      </section>

      <section style={ctaSection}>
        <h2 style={sectionTitle}>Ready to become a founding advertiser?</h2>
        <p style={mutedText}>
          No payment or subscription is required to register interest. We will confirm your package before your ad goes live.
        </p>

        <a href="https://www.hometownperksusa.com/merchant-signup" style={primaryButton}>
          Register Your Interest
        </a>
      </section>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background:
    "linear-gradient(135deg, #020617 0%, #071a52 45%, #0b1f66 100%)",
  color: "white",
  fontFamily: "Arial",
  padding: "38px",
};

const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "70px",
  flexWrap: "wrap" as const,
  gap: "20px",
};

const navLinks = {
  display: "flex",
  gap: "22px",
  alignItems: "center",
};

const navLink = {
  color: "#dbeafe",
  textDecoration: "none",
  fontWeight: 700,
};

const navButton = {
  background: "linear-gradient(90deg,#2563eb,#3b82f6)",
  color: "white",
  padding: "12px 20px",
  borderRadius: "14px",
  textDecoration: "none",
  fontWeight: 800,
};

const heroStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, .8fr)",
  gap: "40px",
  alignItems: "center",
  marginBottom: "70px",
};

const eyebrow = {
  color: "#60a5fa",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  fontWeight: 800,
  marginBottom: "12px",
};

const heroTitle = {
  fontSize: "68px",
  lineHeight: 1,
  letterSpacing: "-2px",
  margin: "0 0 24px",
  maxWidth: "900px",
};

const heroText = {
  color: "#c7d2fe",
  fontSize: "20px",
  lineHeight: 1.7,
  maxWidth: "760px",
  marginBottom: "30px",
};

const primaryButton = {
  display: "inline-block",
  background: "linear-gradient(90deg,#2563eb,#3b82f6)",
  color: "white",
  padding: "16px 26px",
  borderRadius: "16px",
  fontWeight: 800,
  textDecoration: "none",
  boxShadow: "0 8px 30px rgba(37,99,235,.35)",
};

const secondaryButton = {
  display: "inline-block",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(96,165,250,.25)",
  color: "white",
  padding: "16px 26px",
  borderRadius: "16px",
  fontWeight: 800,
  textDecoration: "none",
};

const heroCard = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "30px",
  padding: "36px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 60px rgba(0,0,0,.35)",
};

const cardEyebrow = {
  color: "#93c5fd",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  fontWeight: 800,
};

const miniGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "16px",
  marginTop: "24px",
};

const miniCard = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "20px",
  padding: "20px",
  display: "flex",
  flexDirection: "column" as const,
  gap: "8px",
  color: "#dbeafe",
};

const sectionStyle = {
  marginBottom: "80px",
};

const sectionTitle = {
  fontSize: "44px",
  lineHeight: 1.15,
  marginTop: 0,
  marginBottom: "28px",
};

const stepsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
  gap: "22px",
};

const glassCard = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "24px",
  padding: "28px",
  boxShadow: "0 12px 30px rgba(0,0,0,.22)",
};

const stepNumber = {
  color: "#60a5fa",
  fontWeight: 800,
  marginBottom: "10px",
};

const plansGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
  gap: "26px",
};

const pricingCard = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "30px",
  padding: "34px",
  boxShadow: "0 15px 40px rgba(0,0,0,.25)",
};

const mutedText = {
  color: "#c7d2fe",
  fontSize: "18px",
  lineHeight: 1.6,
};

const priceStyle = {
  fontSize: "46px",
  fontWeight: 900,
  margin: "24px 0",
};

const featureBand = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "30px",
  flexWrap: "wrap" as const,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "30px",
  padding: "40px",
  marginBottom: "70px",
};

const priceBadge = {
  background: "linear-gradient(135deg,#2563eb,#3b82f6)",
  borderRadius: "26px",
  padding: "28px",
  display: "flex",
  flexDirection: "column" as const,
  gap: "8px",
  fontSize: "20px",
  fontWeight: 800,
};

const ctaSection = {
  textAlign: "center" as const,
  padding: "60px 20px 30px",
};