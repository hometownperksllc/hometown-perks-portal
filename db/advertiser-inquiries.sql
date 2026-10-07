create table public.advertiser_inquiries (
 id uuid primary key,
 business_name text not null check (length(business_name) between 1 and 150),
 contact_name text not null check (length(contact_name) between 1 and 150),
 email text not null check (length(email) between 3 and 254),
 phone text not null default '' check (length(phone)<=40),
 service_area text not null check (length(service_area) between 1 and 200),
 message text not null default '' check (length(message)<=1500),
 connect_plate_interest boolean not null default false,
 contact_consent_at timestamptz not null default now(),
 created_at timestamptz not null default now()
);
create index advertiser_inquiries_created on public.advertiser_inquiries(created_at desc,id);
create index advertiser_inquiries_email_created on public.advertiser_inquiries(email,created_at desc);
alter table public.advertiser_inquiries enable row level security;
revoke all on public.advertiser_inquiries from anon,authenticated;
grant all on public.advertiser_inquiries to service_role;
-- Invoker rights: only the server role may call this routine or use the table.
-- One transaction serializes duplicate handling and the hourly intake limits.
create function public.save_advertiser_inquiry(p_id uuid,p_business text,p_contact text,p_email text,p_phone text,p_area text,p_message text,p_plate boolean)
returns text language plpgsql security invoker set search_path='' as $$
begin
 perform pg_catalog.pg_advisory_xact_lock(82461903);
 if exists(select 1 from public.advertiser_inquiries where id=p_id and email=lower(p_email)) then return 'saved'; end if;
 if (select count(*) from public.advertiser_inquiries where created_at>now()-interval '1 hour')>=100
 or (select count(*) from public.advertiser_inquiries where email=lower(p_email) and created_at>now()-interval '1 hour')>=3 then return 'limited'; end if;
 insert into public.advertiser_inquiries(id,business_name,contact_name,email,phone,service_area,message,connect_plate_interest)
 values(p_id,p_business,p_contact,lower(p_email),p_phone,p_area,p_message,p_plate);
 return 'saved';
end $$;
revoke all on function public.save_advertiser_inquiry(uuid,text,text,text,text,text,text,boolean) from public,anon,authenticated;
grant execute on function public.save_advertiser_inquiry(uuid,text,text,text,text,text,text,boolean) to service_role;
