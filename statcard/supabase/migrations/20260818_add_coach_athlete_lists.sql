create table if not exists public.coach_lists (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coach_list_members (
  list_id uuid not null references public.coach_lists(id) on delete cascade,
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (list_id, athlete_id)
);

create index if not exists coach_lists_coach_id_idx on public.coach_lists(coach_id);
create index if not exists coach_list_members_athlete_id_idx on public.coach_list_members(athlete_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.coach_lists to authenticated;
grant select, insert, update, delete on public.coach_list_members to authenticated;

alter table public.coach_lists enable row level security;
alter table public.coach_list_members enable row level security;

create policy "Coaches can view their lists" on public.coach_lists for select using (auth.uid() = coach_id);
create policy "Coaches can create their lists" on public.coach_lists for insert with check (auth.uid() = coach_id);
create policy "Coaches can update their lists" on public.coach_lists for update using (auth.uid() = coach_id) with check (auth.uid() = coach_id);
create policy "Coaches can delete their lists" on public.coach_lists for delete using (auth.uid() = coach_id);

create policy "Coaches can view their list members" on public.coach_list_members for select using (exists (select 1 from public.coach_lists where coach_lists.id = coach_list_members.list_id and coach_lists.coach_id = auth.uid()));
create policy "Coaches can add members to their lists" on public.coach_list_members for insert with check (exists (select 1 from public.coach_lists where coach_lists.id = coach_list_members.list_id and coach_lists.coach_id = auth.uid()));
create policy "Coaches can remove members from their lists" on public.coach_list_members for delete using (exists (select 1 from public.coach_lists where coach_lists.id = coach_list_members.list_id and coach_lists.coach_id = auth.uid()));
