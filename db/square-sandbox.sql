begin;
create table public.square_sandbox_runs (
 id uuid primary key, owner_user_id uuid not null references auth.users(id), live_date date not null, renewal_start_date date not null,
 square_order_id text unique, square_payment_id text unique, square_subscription_id text,
 payment_status text, refund_status text, subscription_status text, stage text not null default 'created',
 webhook_payment_seen_at timestamptz, webhook_refund_seen_at timestamptz,
 last_error_code text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.square_sandbox_runs enable row level security;
revoke all on public.square_sandbox_runs from anon,authenticated;
grant all on public.square_sandbox_runs to service_role;
commit;
