create table if not exists public.registrations (
  id uuid primary key,
  full_name text not null,
  phone_number text not null,
  date_of_birth date not null,
  instagram_name text not null,
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

alter table public.registrations enable row level security;

drop policy if exists "Service role manages registrations" on public.registrations;

create policy "Service role manages registrations"
  on public.registrations
  for all
  to service_role
  using (true)
  with check (true);
