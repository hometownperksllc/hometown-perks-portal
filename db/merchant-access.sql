begin;
-- Public business pages read a limited projection through their server route.
alter table public.connect_plate_setups enable row level security;
revoke all on public.connect_plate_setups from anon, authenticated;
grant select on public.connect_plate_setups to authenticated;
grant insert(user_id,business_display_name,slug,website,facebook,instagram,google_review_link,phone,featured_message,logo_url) on public.connect_plate_setups to authenticated;
grant update(business_display_name,slug,website,facebook,instagram,google_review_link,phone,featured_message,logo_url) on public.connect_plate_setups to authenticated;
do $$ declare p record; begin
 for p in select policyname from pg_policies where schemaname='public' and tablename='connect_plate_setups' loop
  execute format('drop policy %I on public.connect_plate_setups',p.policyname);
 end loop;
end $$;
create policy "Read own plate" on public.connect_plate_setups for select to authenticated using((select auth.uid())=user_id);
create policy "Create own plate" on public.connect_plate_setups for insert to authenticated with check((select auth.uid())=user_id and merchant_id is null and (status is null or status='submitted'));
create policy "Update own plate" on public.connect_plate_setups for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
-- Event ownership is derived by the server; browsers cannot forge another user's ID.
alter table public.connect_plate_scans enable row level security;
alter table public.connect_plate_link_clicks enable row level security;
revoke all on public.connect_plate_scans,public.connect_plate_link_clicks from anon,authenticated;
grant select on public.connect_plate_scans,public.connect_plate_link_clicks to authenticated;
drop policy if exists "Allow authenticated read scans" on public.connect_plate_scans;
drop policy if exists "Allow public insert scans" on public.connect_plate_scans;
drop policy if exists "Allow authenticated read link clicks" on public.connect_plate_link_clicks;
drop policy if exists "Allow public insert link clicks" on public.connect_plate_link_clicks;
create policy "Read own scans" on public.connect_plate_scans for select to authenticated using((select auth.uid())=user_id);
create policy "Read own clicks" on public.connect_plate_link_clicks for select to authenticated using((select auth.uid())=user_id);
grant all on public.connect_plate_setups,public.connect_plate_scans,public.connect_plate_link_clicks to service_role;
-- Administrator membership is provisioned by the service, never by user metadata.
create table public.portal_admin_users(user_id uuid primary key references auth.users(id), created_at timestamptz not null default now());
alter table public.portal_admin_users enable row level security;
revoke all on public.portal_admin_users from anon,authenticated;
grant select on public.portal_admin_users to authenticated;
grant all on public.portal_admin_users to service_role;
create policy "Read own admin membership" on public.portal_admin_users for select to authenticated using((select auth.uid())=user_id);
insert into public.portal_admin_users(user_id) select id from auth.users where lower(email)='info@hometownperksusa.com';
create policy "Admin read merchants" on public.merchants for select to authenticated using(exists(select 1 from public.portal_admin_users a where a.user_id=(select auth.uid())));
create policy "Admin read plates" on public.connect_plate_setups for select to authenticated using(exists(select 1 from public.portal_admin_users a where a.user_id=(select auth.uid())));
create policy "Admin read ad requests" on public.ad_requests for select to authenticated using(exists(select 1 from public.portal_admin_users a where a.user_id=(select auth.uid())));
-- Merchants may approve creative, but cannot set admin notes, paid flags or running status.
revoke update on public.ad_requests from authenticated;
grant update(merchant_approval_status,merchant_feedback,approved_at) on public.ad_requests to authenticated;
revoke insert on public.ad_requests from authenticated;
grant insert(user_id,business_name,promotion_title,promotion_details,preferred_wording,start_date,end_date,images_notes,request_month,uploaded_files) on public.ad_requests to authenticated;
drop policy if exists "Allow authenticated uploads 174qmfp_0" on storage.objects;
drop policy if exists "Allow authenticated uploads oev5vz_0" on storage.objects;
drop policy if exists "Allow logo uploads" on storage.objects;
drop policy if exists "Allow merchant file reads oev5vz_0" on storage.objects;
drop policy if exists "Allow merchant uploads oev5vz_0" on storage.objects;
drop policy if exists "Allow public ad preview reads" on storage.objects;
drop policy if exists "Allow public logo reads" on storage.objects;
drop policy if exists "Allow public reads oev5vz_0" on storage.objects;
update storage.buckets set public=false,file_size_limit=10485760,allowed_mime_types=array['image/jpeg','image/png','image/webp','application/pdf'] where id in ('ad-request-files','ad-previews');
update storage.buckets set file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'] where id='business-logos';
create policy "Read public logos" on storage.objects for select to anon,authenticated using(bucket_id='business-logos');
create policy "Upload own merchant files" on storage.objects for insert to authenticated with check(bucket_id in ('business-logos','ad-request-files') and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Read own private ad files" on storage.objects for select to authenticated using(bucket_id in ('ad-request-files','ad-previews') and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Admin read ad files" on storage.objects for select to authenticated using(bucket_id in ('ad-request-files','ad-previews') and exists(select 1 from public.portal_admin_users a where a.user_id=(select auth.uid())));
create policy "Admin upload ad previews" on storage.objects for insert to authenticated with check(bucket_id='ad-previews' and exists(select 1 from public.portal_admin_users a where a.user_id=(select auth.uid())));
commit;
