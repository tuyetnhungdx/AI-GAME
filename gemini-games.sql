create table if not exists public.ai_gemini_games (
  url text primary key check (char_length(url) <= 2048 and url like 'https://%'),
  title text not null check (char_length(title) between 1 and 120),
  grade text not null check (grade in ('10', '11', '12')),
  lesson text not null check (char_length(lesson) between 1 and 100),
  created_at timestamptz not null default now()
);

alter table public.ai_gemini_games enable row level security;
revoke all on table public.ai_gemini_games from public, anon, authenticated;
grant select, insert on table public.ai_gemini_games to service_role;
