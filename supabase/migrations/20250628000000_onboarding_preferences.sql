alter table profiles
  add column if not exists style_goals text[] default '{}',
  add column if not exists onboarding_audience text;
