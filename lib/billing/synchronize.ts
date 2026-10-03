import type {SquareClient} from 'square';
import type {SupabaseClient} from '@supabase/supabase-js';
import {nextMonthlyDate} from './recurring';
export async function synchronizeInvoice(client:SquareClient,db:SupabaseClient,id:string,environment:string,locationId:string){
 const {invoice}=await client.invoices.get({invoiceId:id});
 if(!invoice?.id || !invoice.subscriptionId || invoice.locationId!==locationId || !invoice.updatedAt)return;
 const {data:b,error}=await db.from('enrollment_billing').select('enrollment_id,renewal_start_date').eq('square_subscription_id',invoice.subscriptionId).maybeSingle();
 if(error)throw error;
 if(!b?.renewal_start_date)return;
 const requests=invoice.paymentRequests??[];
 const due=requests.find(r=>r.dueDate)?.dueDate;
 const currencyValid=requests.every(r=>r.computedAmountMoney?.currency==='USD' && (!r.totalCompletedAmountMoney || r.totalCompletedAmountMoney.currency==='USD'));
 const amount=requests.reduce((sum,r)=>sum+Number(r.computedAmountMoney?.amount??0),0);
 const paid=requests.reduce((sum,r)=>sum+Number(r.totalCompletedAmountMoney?.amount??0),0);
 if(!currencyValid || amount!==14900 || !due || due<b.renewal_start_date)throw new Error('Invoice does not match monthly offer');
 const through=invoice.status==='PAID' && paid===14900?nextMonthlyDate(due,Number(b.renewal_start_date.slice(8,10))):null;
 const result=await db.rpc('record_recurring_invoice',{p_invoice_id:invoice.id,p_subscription_id:invoice.subscriptionId,p_environment:environment,p_status:invoice.status,p_amount:amount,p_paid:paid,p_paid_through:through,p_updated:invoice.updatedAt});
 if(result.error)throw result.error;
}
export async function synchronizeSubscription(client:SquareClient,db:SupabaseClient,id:string,environment:string,locationId:string){
 const {subscription:sub}=await client.subscriptions.get({subscriptionId:id});
 if(!sub?.id || sub.locationId!==locationId)return;
 const {data:b,error}=await db.from('enrollment_billing').select('enrollment_id').eq('square_subscription_id',id).maybeSingle();
 if(error)throw error;
 if(!b)return;
 const {data:e,error:eError}=await db.from('paid_enrollments').select('square_environment').eq('id',b.enrollment_id).single();
 if(eError)throw eError;
 if(e.square_environment!==environment)return;
 const saved=await db.from('enrollment_billing').update({square_subscription_status:sub.status,updated_at:new Date().toISOString()}).eq('enrollment_id',b.enrollment_id);
 if(saved.error)throw saved.error;
}
