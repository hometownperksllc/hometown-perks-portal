create table public.merchant_documents (
 id uuid primary key default gen_random_uuid(),
 merchant_id uuid not null references public.merchants(id),
 title text not null check (char_length(title) between 1 and 160),
 file_name text not null check (char_length(file_name) between 1 and 180),
 storage_path text not null unique,
 file_size integer not null check (file_size between 1 and 3145728),
 uploaded_by uuid not null references auth.users(id),
 created_at timestamptz not null default now()
);
create index merchant_documents_merchant_created_idx on public.merchant_documents(merchant_id,created_at desc);
alter table public.merchant_documents enable row level security;
revoke all on public.merchant_documents from anon,authenticated;
grant select on public.merchant_documents to authenticated;
grant all on public.merchant_documents to service_role;
create policy "Read own merchant documents" on public.merchant_documents for select to authenticated using (
 exists(select 1 from public.merchants m where m.id=merchant_id and m.user_id=(select auth.uid()))
 or exists(select 1 from public.portal_admin_users a where a.user_id=(select auth.uid()))
);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('merchant-documents','merchant-documents',false,3145728,array['application/pdf']);
-- Files are served only by the authenticated server routes after ownership checks.
-- No client upload, update or delete policy is granted for this bucket.
