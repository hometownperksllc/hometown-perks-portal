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
    description: "Maximum exposure for businesses wanting premium placement.",
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
    <main style={{ minHeight: "100vh", background: "#0f172a", color: "white", fontFamily: "Arial" }}>
      <section style={{ padding: "32px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Hometown Perks</h2>
        <div style={{ display: "flex", gap: "18px" }}>
          <a href="#how" style={{ color: "white" }}>How It Works</a>
          <a href="#plans" style={{ color: "white" }}>Plans</a>
          <a href="#contact" style={{ color: "white" }}>Join</a>
        </div>
      </section>

      <section style={{ padding: "70px 40px", maxWidth: "1100px" }}>
        <h1 style={{ fontSize: "56px", lineHeight: "1.05", marginBottom: "24px" }}>
          Helping local businesses get seen, remembered, and supported.
        </h1>
        <p style={{ fontSize: "22px", color: "#cbd5e1", maxWidth: "760px", marginBottom: "32px" }}>
          Hometown Perks is a local business visibility platform combining TV screen advertising,
          business listings, Connect Plate QR/NFC tools, and merchant portal access.
        </p>
        <a href="#plans" style={{ background: "#facc15", color: "#111827", padding: "16px 24px", borderRadius: "12px", fontWeight: "bold", textDecoration: "none" }}>
          View Founding Partner Plans
        </a>
      </section>

      <section id="how" style={{ padding: "40px", background: "#111827" }}>
        <h2 style={{ fontSize: "36px", marginBottom: "24px" }}>How It Works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
          {["Choose a partner plan", "Submit business details", "Upload or request your ad", "Get seen across the network"].map((step, i) => (
            <div key={step} style={{ background: "#1e293b", padding: "24px", borderRadius: "16px" }}>
              <h3>Step {i + 1}</h3>
              <p style={{ color: "#cbd5e1" }}>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="plans" style={{ padding: "60px 40px" }}>
        <h2 style={{ fontSize: "36px", marginBottom: "12px" }}>Founding Partner Plans</h2>
        <p style={{ color: "#cbd5e1", marginBottom: "30px" }}>
          Launch pricing for early local business partners.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {plans.map((plan) => (
            <div key={plan.name} style={{ background: "#1e293b", padding: "28px", borderRadius: "18px" }}>
              <h3 style={{ fontSize: "24px" }}>{plan.name}</h3>
              <p style={{ color: "#cbd5e1" }}>{plan.description}</p>
              <div style={{ fontSize: "34px", fontWeight: "bold", margin: "20px 0" }}>{plan.price}</div>
              <ul style={{ paddingLeft: "20px", color: "#e5e7eb" }}>
                {plan.features.map((feature) => (
                  <li key={feature} style={{ marginBottom: "10px" }}>{feature}</li>
                ))}
              </ul>
              <a href="#contact" style={{ display: "inline-block", marginTop: "18px", background: "#facc15", color: "#111827", padding: "12px 18px", borderRadius: "10px", fontWeight: "bold", textDecoration: "none" }}>
                Become a Partner
              </a>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "50px 40px", background: "#111827" }}>
        <h2 style={{ fontSize: "36px" }}>Connect Plate</h2>
        <p style={{ color: "#cbd5e1", fontSize: "20px", maxWidth: "760px" }}>
          A QR + NFC customer engagement plate that connects customers to reviews, social links,
          menus, websites, offers, and custom mobile landing pages.
        </p>
        <p style={{ fontSize: "24px", fontWeight: "bold" }}>$49 activation + $10/month standalone</p>
      </section>

      <section id="contact" style={{ padding: "60px 40px" }}>
        <h2 style={{ fontSize: "36px" }}>Ready to become a founding partner?</h2>
        <p style={{ color: "#cbd5e1", fontSize: "20px" }}>
          Merchant signup and portal access coming next.
        </p>
      </section>
    </main>
  );
}