const plans = [
  {
    name: "Founding Community Partner",
    price: "$149/mo",
    description: "Consistent local visibility for small businesses.",
    features: [
      "Rotating TV screen advertising",
      "Business directory listing",
      "Merchant portal access",
      "1 ad update per month",
    ],
  },
  {
    name: "Founding Growth Partner",
    price: "$249/mo",
    description: "More visibility plus Connect Plate customer engagement.",
    features: [
      "Increased ad rotation frequency",
      "Connect Plate included",
      "Custom mobile landing page",
      "Priority ad updates",
      "Quarterly social spotlight",
    ],
  },
  {
    name: "Founding Premier Partner",
    price: "$349/mo",
    description: "Maximum exposure for premium placement.",
    features: [
      "Highest ad rotation priority",
      "Featured placement opportunities",
      "Monthly promotional spotlight",
      "Premium Connect Plate experience",
      "Priority support",
    ],
  },
];

export default function Home() {
  return (
    <main style={pageStyle}>
      <section style={navStyle}>
        <h2 style={{ margin: 0 }}>Hometown Perks</h2>

        <div style={navLinks}>
          <a href="#how" style={navLink}>How It Works</a>
          <a href="#plans" style={navLink}>Plans</a>
          <a href="/signup" style={navButton}>Join</a>
        </div>
      </section>

      <section style={heroStyle}>
        <div>
          <p style={eyebrow}>Local Visibility Platform</p>

          <h1 style={heroTitle}>
            Helping local businesses get seen, remembered, and supported.
          </h1>

          <p style={heroText}>
            Hometown Perks combines TV screen advertising, business listings,
            Connect Plate QR/NFC tools, and merchant portal access into one
            simple visibility platform for local businesses.
          </p>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <a href="#plans" style={primaryButton}>
              View Founding Partner Plans
            </a>

            <a href="/signup" style={secondaryButton}>
              Become a Partner
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
            "Choose a partner plan",
            "Submit your business details",
            "Upload or request your ad",
            "Get seen across the network",
          ].map((step, i) => (
            <div key={step} style={glassCard}>
              <p style={stepNumber}>Step {i + 1}</p>
              <h3>{step}</h3>
            </div>
          ))}
        </div>
      </section>

      <section id="plans" style={sectionStyle}>
        <p style={eyebrow}>Founding Partner Plans</p>
        <h2 style={sectionTitle}>Launch pricing for early partners.</h2>

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

              <a href="/signup" style={primaryButton}>
                Become a Partner
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
          <span>$49 activation</span>
          <strong>+$10/mo standalone</strong>
        </div>
      </section>

      <section style={ctaSection}>
        <h2 style={sectionTitle}>Ready to become a founding partner?</h2>
        <p style={mutedText}>
          Join early and help shape the local visibility network in your area.
        </p>

        <a href="/signup" style={primaryButton}>
          Start Merchant Signup
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