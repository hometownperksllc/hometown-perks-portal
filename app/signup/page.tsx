"use client";

import { useState } from "react";

export default function SignupPage() {
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    const response = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        businessName,
        contactName,
        phone,
        email,
        password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error || "Signup failed.");
      return;
    }

    setMessage("Account created successfully!");
  }

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
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          background: "#1e293b",
          padding: "32px",
          borderRadius: "24px",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            marginBottom: "24px",
          }}
        >
          Merchant Signup
        </h1>

        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Contact Name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle}>
            Create Account
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "20px",
              color: "#38bdf8",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "16px",
  borderRadius: "12px",
  border: "none",
};

const buttonStyle = {
  width: "100%",
  background: "#facc15",
  color: "black",
  padding: "14px",
  borderRadius: "12px",
  border: "none",
  fontWeight: "bold" as const,
  cursor: "pointer",
};