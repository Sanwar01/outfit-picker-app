create table public.install_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  platform text not null check (platform in ('ios', 'android', 'both')),
  created_at timestamptz not null default now(),
  unique (email)
);

alter table public.install_requests enable row level security;

revoke all on table public.install_requests from anon, authenticated;
grant insert on table public.install_requests to anon, authenticated;

create policy "install_requests_insert"
  on public.install_requests
  for insert
  to anon, authenticated
  with check (true);
