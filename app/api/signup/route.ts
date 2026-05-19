import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { businessName, contactName, phone, email, password } = body;

    if (!businessName || !contactName || !phone || !email || !password) {
      return NextResponse.json(
        { error: "Missing signup fields." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.user) {
      const { error: merchantError } = await supabase
        .from("merchants")
        .insert([
          {
            user_id: data.user.id,
            business_name: businessName,
            contact_name: contactName,
            phone,
            email,
            onboarding_status: "Active",
            plan: "Starter",
          },
        ]);

      if (merchantError) {
        return NextResponse.json(
          { error: merchantError.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}