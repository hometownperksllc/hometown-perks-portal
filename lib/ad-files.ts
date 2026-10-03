import {supabase} from '@/lib/supabase';
export async function signedFiles<T extends {preview_url?:string;uploaded_files?:string[]}>(rows:T[]):Promise<T[]> {
 return Promise.all(rows.map(async row=>{
  const files=await Promise.all((row.uploaded_files??[]).map(async path=>{
   const {data}=await supabase.storage.from('ad-request-files').createSignedUrl(path,3600);
   return data?.signedUrl??'';
  }));
  let preview='';
  if(row.preview_url){const {data}=await supabase.storage.from('ad-previews').createSignedUrl(row.preview_url,3600);preview=data?.signedUrl??'';}
  return {...row,uploaded_files:files.filter(Boolean),preview_url:preview};
 }));
}
