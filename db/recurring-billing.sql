begin;
create table public.screen_hosts (
 id uuid primary key default gen_random_uuid(), display_name text not null unique,
 legal_name text, address text, signed_agreement_path text, signed_at timestamptz, installed_at timestamptz,
 active boolean not null default false, created_at timestamptz not null default now()
);
alter table public.screen_hosts enable row level security;
revoke all on public.screen_hosts from anon,authenticated;
grant all on public.screen_hosts to service_role;
insert into public.screen_hosts(display_name) values ('Fazoli’s'),('Woodbooger Grill'),('Pikeville Smiles Dental Center'),('Mi Hacienda'),('El Picante'),('The Laundry Den');
create table public.enrollment_billing (
 enrollment_id uuid primary key references public.paid_enrollments(id),
 square_customer_id text, square_card_id text, card_last_four text, card_brand text,
 consent_version text, consent_text text, consent_at timestamptz,
 live_date date, renewal_start_date date, operation_id uuid not null default gen_random_uuid(),
 square_subscription_id text unique, square_subscription_status text,
 cancellation_requested_at timestamptz, cancellation_confirmed_at timestamptz,
 paid_through date, updated_at timestamptz not null default now()
);
alter table public.enrollment_billing enable row level security;
revoke all on public.enrollment_billing from anon,authenticated;
grant all on public.enrollment_billing to service_role;
create function public.prepare_recurring_activation(p_enrollment_id uuid,p_environment text,p_live_date date,p_ad_request_id uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare e public.paid_enrollments; b public.enrollment_billing; host_name text;
begin
 select * into e from public.paid_enrollments where id=p_enrollment_id for update;
 if not found or e.square_environment<>p_environment or e.status not in ('paid_pending_launch','active') then raise exception 'Enrollment is not ready'; end if;
 select * into b from public.enrollment_billing where enrollment_id=e.id for update;
 if not found or b.square_card_id is null or b.square_customer_id is null or b.consent_at is null or b.cancellation_requested_at is not null then raise exception 'Autopay consent is required'; end if;
 if b.square_subscription_id is not null then return to_jsonb(b); end if;
 if not exists(select 1 from public.merchant_payments where enrollment_id=e.id and status='COMPLETED' and amount_cents=14900 and refunded_cents=0) then raise exception 'Verified prepayment is required'; end if;
 if e.launch_deadline<p_live_date or p_live_date<>(now() at time zone 'America/New_York')::date then raise exception 'Launch date is invalid'; end if;
 if coalesce(array_length(e.confirmed_locations,1),0)=0 then raise exception 'Contracted hosts are required'; end if;
 foreach host_name in array e.confirmed_locations loop
  if not exists(select 1 from public.screen_hosts h where h.display_name=host_name and h.active and h.signed_at is not null and h.installed_at is not null and h.signed_agreement_path is not null and exists(select 1 from storage.objects o where o.bucket_id='host-agreements' and o.name=h.signed_agreement_path)) then raise exception 'A host is not signed and installed'; end if;
 end loop;
 if not exists(select 1 from public.ad_requests a where a.id=p_ad_request_id and a.user_id=e.user_id and a.merchant_approval_status='Approved' and a.status in ('Approved','Scheduled','Running')) then raise exception 'Approved creative is required'; end if;
 update public.enrollment_billing set live_date=coalesce(live_date,p_live_date),renewal_start_date=coalesce(renewal_start_date,p_live_date+30),updated_at=now() where enrollment_id=e.id returning * into b;
 return to_jsonb(b);
end $$;
revoke all on function public.prepare_recurring_activation(uuid,text,date,uuid) from public,anon,authenticated;
grant execute on function public.prepare_recurring_activation(uuid,text,date,uuid) to service_role;
create function public.finish_recurring_activation(p_enrollment_id uuid,p_subscription_id text,p_status text)
returns void language plpgsql security invoker set search_path='' as $$
declare b public.enrollment_billing;
begin
 select * into b from public.enrollment_billing where enrollment_id=p_enrollment_id for update;
 if not found or b.live_date is null or b.renewal_start_date is null then raise exception 'Activation not prepared'; end if;
 if not exists(select 1 from public.paid_enrollments e where e.id=p_enrollment_id and e.status in ('paid_pending_launch','active')) then raise exception 'Payment is no longer eligible'; end if;
 if b.square_subscription_id is not null and b.square_subscription_id<>p_subscription_id then raise exception 'Subscription mismatch'; end if;
 update public.enrollment_billing set square_subscription_id=p_subscription_id,square_subscription_status=p_status,paid_through=coalesce(paid_through,renewal_start_date),updated_at=now() where enrollment_id=p_enrollment_id;
 update public.paid_enrollments set launch_started_at=coalesce(launch_started_at,now()),status='active' where id=p_enrollment_id and status='paid_pending_launch';
 update public.merchants set onboarding_status='Active' where id=(select merchant_id from public.paid_enrollments where id=p_enrollment_id and status='active');
end $$;
revoke all on function public.finish_recurring_activation(uuid,text,text) from public,anon,authenticated;
grant execute on function public.finish_recurring_activation(uuid,text,text) to service_role;
create table public.recurring_invoices (
 square_invoice_id text primary key, enrollment_id uuid not null references public.paid_enrollments(id),
 status text not null, amount_cents integer not null, paid_cents integer not null, paid_through date,
 square_updated_at timestamptz not null, updated_at timestamptz not null default now()
);
alter table public.recurring_invoices enable row level security;
revoke all on public.recurring_invoices from anon,authenticated;
grant all on public.recurring_invoices to service_role;
create function public.record_recurring_invoice(p_invoice_id text,p_subscription_id text,p_environment text,p_status text,p_amount integer,p_paid integer,p_paid_through date,p_updated timestamptz)
returns boolean language plpgsql security invoker set search_path='' as $$
declare b public.enrollment_billing; affected integer;
begin
 select b0.* into b from public.enrollment_billing b0 join public.paid_enrollments e on e.id=b0.enrollment_id where b0.square_subscription_id=p_subscription_id and e.square_environment=p_environment for update of b0;
 if not found then return false; end if;
 if p_amount<>14900 or p_paid<0 or p_paid>14900 then raise exception 'Invoice amount mismatch'; end if;
 if p_paid_through is not null and (p_status<>'PAID' or p_paid<>14900 or p_paid_through<=b.renewal_start_date) then raise exception 'Paid coverage is invalid'; end if;
 insert into public.recurring_invoices(square_invoice_id,enrollment_id,status,amount_cents,paid_cents,paid_through,square_updated_at) values(p_invoice_id,b.enrollment_id,p_status,p_amount,p_paid,p_paid_through,p_updated)
 on conflict(square_invoice_id) do update set status=excluded.status,paid_cents=excluded.paid_cents,paid_through=excluded.paid_through,square_updated_at=excluded.square_updated_at,updated_at=now() where public.recurring_invoices.enrollment_id=excluded.enrollment_id and public.recurring_invoices.square_updated_at<=excluded.square_updated_at;
 get diagnostics affected=row_count;
 if affected=0 then return true; end if;
 if p_paid_through is not null then update public.enrollment_billing set paid_through=greatest(paid_through,p_paid_through),updated_at=now() where enrollment_id=b.enrollment_id; end if;
 return true;
end $$;
revoke all on function public.record_recurring_invoice(text,text,text,text,integer,integer,date,timestamptz) from public,anon,authenticated;
grant execute on function public.record_recurring_invoice(text,text,text,text,integer,integer,date,timestamptz) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('host-agreements','host-agreements',false,10485760,array['application/pdf','image/jpeg','image/png']);
create policy "Admin read host agreements" on storage.objects for select to authenticated using(bucket_id='host-agreements' and exists(select 1 from public.portal_admin_users a where a.user_id=(select auth.uid())));
create policy "Admin upload host agreements" on storage.objects for insert to authenticated with check(bucket_id='host-agreements' and exists(select 1 from public.portal_admin_users a where a.user_id=(select auth.uid())));
commit;
