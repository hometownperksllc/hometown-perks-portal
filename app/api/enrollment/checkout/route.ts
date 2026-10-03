import {database,userFor,settings,launchReady,square,squareEnvironment,billingOrigin} from '@/lib/billing/server';
export async function POST(request:Request) {
 try {
 if(process.env.PAID_ENROLLMENT_ENABLED!=='true') return Response.json({error:'Paid enrollment is not open yet.'},{status:403});
 const config=await settings();
 if(!launchReady(config)) return Response.json({error:'Paid enrollment is not open yet.'},{status:403});
 const user=await userFor(request);
 if(!user) return Response.json({error:'Sign in with a confirmed email first.'},{status:401});
 const body=await request.json();
 const fields=['businessName','contactName','phone'] as const;
 if(fields.some(k=>typeof body[k]!=='string' || !body[k].trim() || body[k].length>150) || body.acceptTerms!==true || body.termsVersion!==config.terms_version) return Response.json({error:'Complete your business details and accept the current launch terms.'},{status:400});
 const client=square(), db=database();
 const {data:existing,error:readError}=await db.from('paid_enrollments').select('*').eq('user_id',user.id).maybeSingle();
 if(readError) throw readError;
 if(existing && existing.status!=='awaiting_payment') return Response.json({error:'Your enrollment already has a payment. Check its status.'},{status:409});
 if(existing && existing.square_environment!==squareEnvironment()) return Response.json({error:'Enrollment environment has changed. Contact support.'},{status:409});
 if(existing && (existing.terms_version!==config.terms_version || existing.terms_text!==config.terms_text || existing.launch_deadline!==config.launch_deadline || JSON.stringify(existing.confirmed_locations)!==JSON.stringify(config.confirmed_locations) || existing.amount_cents!==config.amount_cents)) return Response.json({error:'Your reservation terms have changed. Contact support before paying.'},{status:409});
 if(existing?.checkout_url) return Response.json({url:existing.checkout_url});
 const {data:merchant,error:merchantError}=await db.from('merchants').upsert({user_id:user.id,email:user.email,business_name:body.businessName.trim(),contact_name:body.contactName.trim(),phone:body.phone.trim(),plan:'Founding Advertiser',onboarding_status:'Awaiting Payment'},{onConflict:'user_id'}).select('id').single();
 if(merchantError) throw merchantError;
 let enrollment=existing;
 if(!enrollment) {
 const {data,error}=await db.from('paid_enrollments').upsert({user_id:user.id,merchant_id:merchant.id,amount_cents:config.amount_cents,terms_version:config.terms_version,terms_text:config.terms_text,launch_deadline:config.launch_deadline,confirmed_locations:config.confirmed_locations,square_environment:squareEnvironment()},{onConflict:'user_id',ignoreDuplicates:true});
 if(error) throw error;
 void data;
 const result=await db.from('paid_enrollments').select('*').eq('user_id',user.id).single();
 if(result.error) throw result.error;
 enrollment=result.data;
 }
 const result=await client.checkout.paymentLinks.create({idempotencyKey:enrollment.id,quickPay:{name:'Hometown Perks - First Month Advertising Reservation',priceMoney:{amount:BigInt(enrollment.amount_cents),currency:'USD'},locationId:process.env.SQUARE_LOCATION_ID!},checkoutOptions:{redirectUrl:billingOrigin()+'/enroll?checkout=returned',allowTipping:false},prePopulatedData:{buyerEmail:user.email},paymentNote:'First month credit; service begins at launch. '+enrollment.id});
 const link=result.paymentLink;
 if(!link?.url || !link.orderId || !link.id) throw new Error('Missing checkout link');
 const {error}=await db.from('paid_enrollments').update({square_order_id:link.orderId,square_link_id:link.id,checkout_url:link.url}).eq('id',enrollment.id);
 if(error) throw error;
 return Response.json({url:link.url});
 } catch {return Response.json({error:'Checkout is unavailable. No payment has been requested by this page. Please try again later.'},{status:503});}
}
