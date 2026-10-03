// Email notifications must come from verified workflow transitions.
export async function POST() {
 return Response.json({error:'This email endpoint is unavailable.'},{status:410});
}
