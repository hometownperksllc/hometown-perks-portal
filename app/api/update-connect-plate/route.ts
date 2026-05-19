import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const { error } = await supabase
      .from("connect_plate_setups")
      .update({
        website: data.website,
        facebook: data.facebook,
        instagram: data.instagram,
        google_review_link: data.google_review_link,
        phone: data.phone,
        featured_message: data.featured_message,
      })
      .eq("id", data.id);

    if (error) {
      throw error;
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}