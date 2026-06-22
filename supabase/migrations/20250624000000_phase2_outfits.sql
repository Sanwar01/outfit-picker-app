-- Outfits
create table outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  is_favorite boolean default false,
  weather_snapshot jsonb,
  ai_rationale text,
  created_at timestamptz default now()
);

create table outfit_items (
  outfit_id uuid not null references outfits(id) on delete cascade,
  clothing_item_id uuid not null references clothing_items(id) on delete cascade,
  slot clothing_category not null,
  primary key (outfit_id, clothing_item_id)
);

create table wear_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  outfit_id uuid references outfits(id) on delete set null,
  worn_at timestamptz default now()
);

create index outfits_user_id_idx on outfits(user_id);
create index outfits_user_favorite_idx on outfits(user_id, is_favorite);
create index wear_log_user_id_idx on wear_log(user_id);

alter table outfits enable row level security;
alter table outfit_items enable row level security;
alter table wear_log enable row level security;

create policy "outfits_select_own" on outfits for select using (auth.uid() = user_id);
create policy "outfits_insert_own" on outfits for insert with check (auth.uid() = user_id);
create policy "outfits_update_own" on outfits for update using (auth.uid() = user_id);
create policy "outfits_delete_own" on outfits for delete using (auth.uid() = user_id);

create policy "outfit_items_select_own" on outfit_items for select using (
  exists (
    select 1 from outfits
    where outfits.id = outfit_items.outfit_id
    and outfits.user_id = auth.uid()
  )
);
create policy "outfit_items_insert_own" on outfit_items for insert with check (
  exists (
    select 1 from outfits
    where outfits.id = outfit_items.outfit_id
    and outfits.user_id = auth.uid()
  )
);
create policy "outfit_items_delete_own" on outfit_items for delete using (
  exists (
    select 1 from outfits
    where outfits.id = outfit_items.outfit_id
    and outfits.user_id = auth.uid()
  )
);

create policy "wear_log_select_own" on wear_log for select using (auth.uid() = user_id);
create policy "wear_log_insert_own" on wear_log for insert with check (auth.uid() = user_id);
