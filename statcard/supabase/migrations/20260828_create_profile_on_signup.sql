-- Create the public profile at the same time as the auth user. This also
-- covers projects where email confirmation means signUp() has no session yet.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  profile_username text := lower(trim(new.raw_user_meta_data ->> 'username'));
  profile_first_name text := coalesce(new.raw_user_meta_data ->> 'first_name', '');
  profile_last_name text := coalesce(new.raw_user_meta_data ->> 'last_name', '');
  profile_account_type text := coalesce(new.raw_user_meta_data ->> 'account_type', 'athlete');
begin
  if profile_account_type = 'coach' then
    insert into public.coachprofiles (id, first_name, last_name, username)
    values (new.id, profile_first_name, profile_last_name, profile_username)
    on conflict (id) do update set
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      username = excluded.username;
  else
    insert into public.profiles (id, first_name, last_name, username, account_type)
    values (new.id, profile_first_name, profile_last_name, profile_username, 'athlete')
    on conflict (id) do update set
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      username = excluded.username,
      account_type = excluded.account_type;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();
