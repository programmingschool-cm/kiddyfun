-- KiddyFun Code — security hardening (run after 001_initial_schema.sql)
-- Prevents students from changing their own role via the API.

create or replace function public.profiles_prevent_privilege_escalation()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and old.role is distinct from new.role then
    -- Block API users; allow Dashboard/SQL (no JWT user) to set teacher role
    if auth.uid() is not null then
      raise exception 'role cannot be changed via the app';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_escalation on public.profiles;
create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.profiles_prevent_privilege_escalation();

-- Optional: index for teacher roster / sync lookups
create index if not exists programs_user_id_idx on public.programs (user_id);
create index if not exists mission_progress_user_id_idx on public.mission_progress (user_id);
create index if not exists badges_user_id_idx on public.badges (user_id);
create index if not exists profiles_class_code_idx on public.profiles (class_code);
