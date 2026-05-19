import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { to, subject, message } = body;

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: "Missing email fields." },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: `Hometown Perks <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color:#020b2d;">Hometown Perks</h2>
          <p>${message}</p>
          <p>
            <a href="http://localhost:3000/dashboard">
              View your merchant dashboard
            </a>
          </p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}