alter table clothing_items
  add column if not exists brand text,
  add column if not exists material text,
  add column if not exists warmth smallint
    check (warmth is null or (warmth between 1 and 5)),
  add column if not exists notes text,
  add column if not exists care_instructions text,
  add column if not exists occasions text[] not null default '{}',
  add column if not exists style_tags text[] not null default '{}';
