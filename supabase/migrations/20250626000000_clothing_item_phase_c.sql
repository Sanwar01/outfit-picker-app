alter table clothing_items
  add column if not exists is_favorite boolean not null default false,
  add column if not exists purchase_price numeric(10, 2)
    check (purchase_price is null or purchase_price >= 0),
  add column if not exists description text;

create table if not exists clothing_item_images (
  id uuid primary key default gen_random_uuid(),
  clothing_item_id uuid not null references clothing_items(id) on delete cascade,
  image_url text not null,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists clothing_item_images_item_idx
  on clothing_item_images(clothing_item_id, sort_order);

alter table clothing_item_images enable row level security;

create policy "clothing_item_images_select_own" on clothing_item_images
  for select using (
    exists (
      select 1 from clothing_items
      where clothing_items.id = clothing_item_images.clothing_item_id
      and clothing_items.user_id = auth.uid()
    )
  );

create policy "clothing_item_images_insert_own" on clothing_item_images
  for insert with check (
    exists (
      select 1 from clothing_items
      where clothing_items.id = clothing_item_images.clothing_item_id
      and clothing_items.user_id = auth.uid()
    )
  );

create policy "clothing_item_images_delete_own" on clothing_item_images
  for delete using (
    exists (
      select 1 from clothing_items
      where clothing_items.id = clothing_item_images.clothing_item_id
      and clothing_items.user_id = auth.uid()
    )
  );
