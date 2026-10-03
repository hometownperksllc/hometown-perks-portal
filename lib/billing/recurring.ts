import type {SubscriptionPhase} from 'square';
export const RECURRING_CONSENT_VERSION='monthly-149-v1';
export const RECURRING_CONSENT_TEXT='I authorize Hometown Perks, LLC to store my card securely with Square and charge $149 monthly after the first 30 calendar days of my prepaid advertising service. No monthly charge begins before my advertisement is live and the prepaid period has ended. I may cancel before the next charge through the portal or by emailing michael@hometownperksusa.com. Cancellation ends renewal charges and service continues through the paid period. Add-ons require separate consent.';
export function recurringEnabled(){return process.env.RECURRING_BILLING_ENABLED==='true';}
export function localDate(at=new Date()){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(at);
 const part=(key:string)=>parts.find(p=>p.type===key)!.value;
 return `${part('year')}-${part('month')}-${part('day')}`;
}
export function firstRenewalDate(liveDate:string){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(liveDate)) throw new Error('Invalid launch date');
 const date=new Date(liveDate+'T00:00:00Z');
 if(!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10)!==liveDate) throw new Error('Invalid launch date');
 date.setUTCDate(date.getUTCDate()+30);
 return date.toISOString().slice(0,10);
}
export function validMonthlyPlan(phases:SubscriptionPhase[]|undefined){
 if(phases?.length!==1) return false;
 const phase=phases[0],money=phase.pricing?.priceMoney??phase.recurringPriceMoney;
 return phase.cadence==='MONTHLY' && phase.periods==null && (!phase.pricing || phase.pricing.type==='STATIC') && !phase.pricing?.discountIds?.length && money?.amount===BigInt(14900) && money.currency==='USD';
}
export function nextMonthlyDate(start:string,anchor:number){
 const date=new Date(start+'T00:00:00Z');
 if(!Number.isFinite(date.getTime()) || anchor<1 || anchor>31)throw new Error('Invalid billing date');
 const year=date.getUTCFullYear(),month=date.getUTCMonth()+1;
 const last=new Date(Date.UTC(year,month+1,0)).getUTCDate();
 return new Date(Date.UTC(year,month,Math.min(anchor,last))).toISOString().slice(0,10);
}
