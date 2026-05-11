create table if not exists public.registrations (
  id uuid primary key,
  full_name text not null,
  phone_number text not null,
  phone_number_normalized text,
  email text not null,
  date_of_birth date not null,
  instagram_name text not null,
  instagram_name_normalized text,
  bringing_guests text not null default 'no' check (bringing_guests in ('yes', 'no')),
  guests jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists registrations_status_idx
  on public.registrations (status);

create index if not exists registrations_created_at_idx
  on public.registrations (created_at desc);

alter table public.registrations
  add column if not exists phone_number_normalized text;

alter table public.registrations
  add column if not exists instagram_name_normalized text;

alter table public.registrations
  add column if not exists email text;

update public.registrations
set
  phone_number_normalized = case
    when trim(phone_number) like '+%' then regexp_replace(phone_number, '\D', '', 'g')
    when regexp_replace(phone_number, '\D', '', 'g') like '00%' then substring(regexp_replace(phone_number, '\D', '', 'g') from 3)
    when regexp_replace(phone_number, '\D', '', 'g') like '0%' then '41' || substring(regexp_replace(phone_number, '\D', '', 'g') from 2)
    else regexp_replace(phone_number, '\D', '', 'g')
  end,
  instagram_name_normalized = lower(instagram_name)
where phone_number_normalized is null
  or instagram_name_normalized is null;

create unique index if not exists registrations_phone_number_normalized_key
  on public.registrations (phone_number_normalized)
  where phone_number_normalized is not null and phone_number_normalized <> '';

create unique index if not exists registrations_instagram_name_normalized_key
  on public.registrations (instagram_name_normalized)
  where instagram_name_normalized is not null and instagram_name_normalized <> '';

alter table public.registrations enable row level security;

drop policy if exists "Service role manages registrations" on public.registrations;

create policy "Service role manages registrations"
  on public.registrations
  for all
  to service_role
  using (true)
  with check (true);
