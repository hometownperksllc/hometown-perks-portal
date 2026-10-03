import { database, userFor } from "@/lib/billing/server";

export async function POST(request: Request) {
  try {
    const user = await userFor(request);
    if (!user) return Response.json({ error: 'Sign in first.' }, { status: 401 });
    const data = await request.json();
    const fields = ['website', 'facebook', 'instagram', 'google_review_link', 'phone', 'featured_message'];
    if (typeof data.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(data.id) || fields.some(field => typeof data[field] !== 'string' || data[field].length > 1000))
      return Response.json({ error: 'Invalid setup fields.' }, { status: 400 });
    for (const field of fields.slice(0, 4)) {
      if (!data[field]) continue;
      try { if (!['https:', 'http:'].includes(new URL(data[field]).protocol)) throw new Error(); }
      catch { return Response.json({ error: 'Use valid http or https links.' }, { status: 400 }); }
    }

    const { data: saved, error } = await database()
      .from("connect_plate_setups")
      .update({
        website: data.website,
        facebook: data.facebook,
        instagram: data.instagram,
        google_review_link: data.google_review_link,
        phone: data.phone,
        featured_message: data.featured_message,
      })
      .eq("id", data.id).eq('user_id', user.id).select('id').maybeSingle();

    if (error) {
      throw error;
    }
    if (!saved) return Response.json({ error: 'Setup not found.' }, { status: 404 });

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { success: false, error: 'Unable to save the setup.' },
      { status: 500 }
    );
  }
}
