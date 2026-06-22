-- Enums
create type clothing_category as enum ('top','bottom','outerwear','shoes','accessory');
create type clothing_status as enum ('active','archived');

-- Profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  location_lat double precision,
  location_lng double precision,
  location_city text,
  style_vibes text[] default '{}',
  onboarding_complete boolean default false,
  created_at timestamptz default now()
);

-- Clothing items
create table clothing_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  name text not null default 'Clothing item',
  category clothing_category not null,
  colors text[] default '{}',
  season text[] default '{}',
  formality smallint default 2 check (formality between 1 and 5),
  pattern text default 'solid',
  status clothing_status default 'active',
  ai_confidence real,
  wear_count int default 0,
  last_worn_at timestamptz,
  created_at timestamptz default now()
);

create index clothing_items_user_status_idx on clothing_items(user_id, status);
create index clothing_items_category_idx on clothing_items(user_id, category);

-- RLS
alter table profiles enable row level security;
alter table clothing_items enable row level security;

create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

create policy "clothing_select_own" on clothing_items for select using (auth.uid() = user_id);
create policy "clothing_insert_own" on clothing_items for insert with check (auth.uid() = user_id);
create policy "clothing_update_own" on clothing_items for update using (auth.uid() = user_id);
create policy "clothing_delete_own" on clothing_items for delete using (auth.uid() = user_id);

-- Auto-create profile on signup
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('wardrobe-images', 'wardrobe-images', false);

-- Storage RLS: path = {user_id}/{filename}
create policy "wardrobe_select_own" on storage.objects
  for select using (bucket_id = 'wardrobe-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "wardrobe_insert_own" on storage.objects
  for insert with check (bucket_id = 'wardrobe-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "wardrobe_update_own" on storage.objects
  for update using (bucket_id = 'wardrobe-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "wardrobe_delete_own" on storage.objects
  for delete using (bucket_id = 'wardrobe-images' and auth.uid()::text = (storage.foldername(name))[1]);
