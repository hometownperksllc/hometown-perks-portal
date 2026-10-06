import {supabase} from '@/lib/supabase';
export type MerchantDocument={id:string;title:string;file_name:string;file_size:number;created_at:string};
export async function documentRequest(url:string,form?:FormData){
 const {data:{session}}=await supabase.auth.getSession();if(!session)throw Error('Sign in to access your documents.');
 const response=await fetch(url,{method:form?'POST':'GET',headers:{Authorization:`Bearer ${session.access_token}`},...(form?{body:form}:{cache:'no-store'})});
 const result=await response.json();if(!response.ok)throw Error(result.error??'Document request failed.');return result;
}
export async function openDocument(id:string,download=false){
 const result=await documentRequest(`/api/merchant/documents?id=${encodeURIComponent(id)}${download?'&download=1':''}`);
 window.location.assign(result.url);
}
