import {launchReady,settings} from '@/lib/billing/server';
export const dynamic='force-dynamic';
export async function GET() {
 try { const config=await settings();
 if(!launchReady(config)) return Response.json({enabled:false});
 return Response.json({enabled:true,amountCents:config.amount_cents,termsVersion:config.terms_version,termsText:config.terms_text,launchDeadline:config.launch_deadline,locations:config.confirmed_locations});
 } catch { return Response.json({enabled:false}); }
}
