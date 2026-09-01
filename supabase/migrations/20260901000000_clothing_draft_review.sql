-- Draft lifecycle for upload review flow
alter type clothing_status add value if not exists 'draft';

alter table clothing_items
  add column if not exists size text,
  add column if not exists fit text
    check (fit is null or fit in ('regular', 'slim', 'relaxed', 'oversized')),
  add column if not exists purchase_date date,
  add column if not exists exclude_from_recommendations boolean not null default false,
  add column if not exists confirmed_at timestamptz,
  add column if not exists ai_tagged_at timestamptz,
  add column if not exists tagging_status text
    check (tagging_status is null or tagging_status in ('pending', 'complete', 'failed')),
  add column if not exists ai_suggested jsonb;

update clothing_items
set tagging_status = 'complete'
where status = 'active' and tagging_status is null;

create index if not exists clothing_items_user_draft_idx
  on clothing_items(user_id, status)
  where status = 'draft';
