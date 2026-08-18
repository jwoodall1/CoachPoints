-- Apply this if coach_lists already exists but inserts fail with
-- "permission denied for table coach_lists".
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.coach_lists to authenticated;
grant select, insert, update, delete on public.coach_list_members to authenticated;
