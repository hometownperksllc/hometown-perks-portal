"use client";

export default function TestEmailPage() {
  async function sendTestEmail() {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "support@hometownperksusa.com",
        subject: "Hometown Perks Test Email",
        message: "This is a test email from your merchant portal.",
      }),
    });

    const result = await response.json();
    console.log(result);
    alert("Test email sent. Check Zoho inbox.");
  }

  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Test Email</h1>

      <button onClick={sendTestEmail}>
        Send Test Email
      </button>
    </main>
  );
}