-- Username for password-based login (Supabase Auth still uses email internally)
alter table profiles add column if not exists username text;

create unique index if not exists profiles_username_lower_idx
  on profiles (lower(username));

alter table profiles
  add constraint profiles_username_length
  check (username is null or char_length(username) between 3 and 24);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'username'
    )
  );
  return new;
end; $$;
