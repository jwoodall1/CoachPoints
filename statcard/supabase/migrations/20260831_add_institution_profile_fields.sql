-- Add the fields consumed by the institution directory and profile pages.
-- The institutions and sports tables already exist in the database.

alter table public.institutions
  add column if not exists slug text,
  add column if not exists logo_url text,
  add column if not exists primary_color text not null default '#0f172a',
  add column if not exists secondary_color text not null default '#e2e8f0',
  add column if not exists tagline text,
  add column if not exists about text,
  add column if not exists website_url text,
  add column if not exists athletics_url text;

update public.institutions
set slug = lower(
  regexp_replace(
    regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'),
    '(^-|-$)',
    '',
    'g'
  )
)
where slug is null;

alter table public.institutions
  alter column slug set not null;

create unique index if not exists institutions_slug_key
  on public.institutions (slug);

alter table public.sports
  add column if not exists official_url text;
