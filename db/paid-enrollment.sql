begin;
-- Merchant accounts are provisioned only by a verified server-side enrollment request.
drop policy if exists "Allow dashboard read" on public.merchants;
drop policy if exists "Allow merchant signups" on public.merchants;
revoke insert, update, delete on public.merchants from anon, authenticated;
create unique index if not exists merchants_user_unique on public.merchants(user_id);
create table public.enrollment_settings (
 id boolean primary key default true check(id), enabled boolean not null default false,
 amount_cents integer not null default 14900 check(amount_cents = 14900),
 terms_version text, terms_text text, launch_deadline date,
 confirmed_locations text[] not null default '{}', updated_at timestamptz not null default now()
);
insert into public.enrollment_settings(id) values(true);
alter table public.enrollment_settings enable row level security;
revoke all on public.enrollment_settings from anon, authenticated;
grant select on public.enrollment_settings to anon, authenticated;
create policy "Read launch configuration" on public.enrollment_settings for select to anon,authenticated using(true);
create table public.paid_enrollments (
 id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id),
 merchant_id uuid not null references public.merchants(id),
 amount_cents integer not null check(amount_cents = 14900), currency text not null default 'USD' check(currency='USD'),
 terms_version text not null, terms_text text not null, launch_deadline date not null,
 confirmed_locations text[] not null, accepted_at timestamptz not null default now(),
 status text not null default 'awaiting_payment' check(status in ('awaiting_payment','paid_pending_launch','active','partially_refunded','refunded')),
 square_environment text not null check(square_environment in ('sandbox','production')),
 square_order_id text unique, square_link_id text unique, checkout_url text,
 launch_started_at timestamptz, created_at timestamptz not null default now()
);
alter table public.paid_enrollments enable row level security;
revoke all on public.paid_enrollments from anon,authenticated;
grant select on public.paid_enrollments to authenticated;
create policy "Read own enrollment" on public.paid_enrollments for select to authenticated using((select auth.uid())=user_id);
create table public.merchant_payments (
 square_payment_id text primary key, enrollment_id uuid not null references public.paid_enrollments(id),
 status text not null, amount_cents bigint not null, refunded_cents bigint not null default 0,
 square_updated_at timestamptz not null, updated_at timestamptz not null default now()
);
alter table public.merchant_payments enable row level security;
revoke all on public.merchant_payments from anon,authenticated;
grant select on public.merchant_payments to authenticated;
create policy "Read own payments" on public.merchant_payments for select to authenticated using(exists(select 1 from public.paid_enrollments e where e.id=enrollment_id and e.user_id=(select auth.uid())));
grant all on public.enrollment_settings,public.paid_enrollments,public.merchant_payments to service_role;
-- A single transaction records payment state; retrying or receiving older events cannot duplicate it.
create function public.record_merchant_payment(p_payment_id text,p_order_id text,p_environment text,p_status text,p_amount bigint,p_refunded bigint,p_updated timestamptz)
returns boolean language plpgsql security invoker set search_path='' as $$
declare e public.paid_enrollments; affected integer;
begin
 select * into e from public.paid_enrollments where square_order_id=p_order_id and square_environment=p_environment for update;
 if not found then return false; end if;
 if p_amount<>e.amount_cents or p_refunded<0 or p_refunded>p_amount then raise exception 'Payment amount mismatch'; end if;
 insert into public.merchant_payments(square_payment_id,enrollment_id,status,amount_cents,refunded_cents,square_updated_at)
 values(p_payment_id,e.id,p_status,p_amount,p_refunded,p_updated)
 on conflict(square_payment_id) do update set status=excluded.status,refunded_cents=excluded.refunded_cents,square_updated_at=excluded.square_updated_at,updated_at=now()
 where public.merchant_payments.enrollment_id=excluded.enrollment_id and public.merchant_payments.square_updated_at<=excluded.square_updated_at;
 get diagnostics affected = row_count;
 if affected=0 then return true; end if;
 if p_status='COMPLETED' then
 update public.paid_enrollments set status=case when p_refunded=p_amount then 'refunded' when p_refunded>0 then 'partially_refunded' when status='active' then 'active' else 'paid_pending_launch' end where id=e.id;
 update public.merchants set onboarding_status=case when p_refunded=p_amount then 'Refunded' when p_refunded>0 then 'Payment Review' else 'Paid - Pending Launch' end where id=e.merchant_id and onboarding_status<>'Active';
 end if;
 return true;
end $$;
revoke all on function public.record_merchant_payment(text,text,text,text,bigint,bigint,timestamptz) from public,anon,authenticated;
grant execute on function public.record_merchant_payment(text,text,text,text,bigint,bigint,timestamptz) to service_role;
commit;
