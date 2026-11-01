-- KiddyFun Code — production safety (run after 001–004)
-- Closes public gallery inserts, ignores client-supplied roles,
-- and stops students from writing class_code or creating classes.

-- ── New accounts are always students ─────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  v_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'Kiddy Coder');
  if char_length(v_name) > 32 then
    v_name := left(v_name, 32);
  end if;

  insert into public.profiles (id, display_name, role)
  values (new.id, v_name, 'student')
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ── Block role and class_code changes from the API ───────────────────────────
create or replace function public.profiles_prevent_privilege_escalation()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and auth.uid() is not null then
    if old.role is distinct from new.role then
      raise exception 'role cannot be changed via the app';
    end if;
    if old.class_code is distinct from new.class_code
       and coalesce(current_setting('app.joining_class', true), '') <> '1' then
      raise exception 'class_code can only be changed by joining a class';
    end if;
  end if;
  return new;
end;
$$;

-- Helpers live in 001. Recreate them here so an older database can run 005 alone.
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.role from public.profiles p where p.id = auth.uid()
$$;

create or replace function public.current_user_class_code()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.class_code from public.profiles p where p.id = auth.uid()
$$;

revoke all on function public.current_user_role() from public;
revoke all on function public.current_user_class_code() from public;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.current_user_class_code() to authenticated;

-- ── Classes: only a teacher profile may own a class ─────────────────────────
-- Role is read through a security-definer helper. Selecting profiles from a
-- profiles policy makes Postgres recurse and PostgREST return 500.
drop policy if exists classes_teacher_all on public.classes;
create policy classes_teacher_all on public.classes
  for all
  using (auth.uid() = teacher_id and public.current_user_role() = 'teacher')
  with check (auth.uid() = teacher_id and public.current_user_role() = 'teacher');

drop policy if exists profiles_teacher_read_class on public.profiles;
create policy profiles_teacher_read_class on public.profiles
  for select using (
    public.current_user_role() = 'teacher'
    and exists (
      select 1
      from public.classes c
      where c.teacher_id = auth.uid()
        and c.class_code = profiles.class_code
    )
  );

drop policy if exists class_members_teacher_read on public.class_members;
create policy class_members_teacher_read on public.class_members
  for select using (
    public.current_user_role() = 'teacher'
    and exists (
      select 1
      from public.classes c
      where c.id = class_members.class_id
        and c.teacher_id = auth.uid()
    )
  );

create or replace function public.join_class_by_code(p_class_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select id into v_class_id
  from public.classes
  where upper(trim(class_code)) = upper(trim(p_class_code))
  limit 1;

  if v_class_id is null then
    raise exception 'Class code not found';
  end if;

  perform set_config('app.joining_class', '1', true);

  update public.profiles
  set class_code = upper(trim(p_class_code)), updated_at = now()
  where id = v_uid;

  insert into public.class_members (class_id, student_id)
  values (v_class_id, v_uid)
  on conflict (class_id, student_id) do nothing;
end;
$$;

-- ── Gallery: signed-in author only, smaller programs, hide author_id ────────
alter table public.published_programs drop constraint if exists published_code_len;
alter table public.published_programs
  add constraint published_code_len check (char_length(code) <= 20000);

create or replace function public.publish_program(
  p_code text,
  p_title text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_share_id text;
  v_try int := 0;
  v_title text;
  v_uid uuid := auth.uid();
  v_recent int;
begin
  if v_uid is null then
    raise exception 'Sign in before publishing';
  end if;
  if p_code is null or length(trim(p_code)) = 0 then
    raise exception 'Code cannot be empty';
  end if;
  if length(p_code) > 20000 then
    raise exception 'Code is too large (max 20000 characters)';
  end if;

  select count(*) into v_recent
  from public.published_programs
  where author_id = v_uid
    and created_at > now() - interval '1 hour';
  if v_recent >= 10 then
    raise exception 'Too many publishes. Try again in a little while.';
  end if;

  v_title := coalesce(nullif(trim(p_title), ''), 'Shared Program');
  if length(v_title) > 120 then
    v_title := left(v_title, 120);
  end if;

  loop
    v_share_id := lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
    begin
      insert into public.published_programs (share_id, code, title, author_id)
      values (v_share_id, p_code, v_title, v_uid);
      return v_share_id;
    exception
      when unique_violation then
        v_try := v_try + 1;
        if v_try > 8 then
          raise exception 'Could not generate a unique share id';
        end if;
    end;
  end loop;
end;
$$;

revoke all on function public.publish_program(text, text) from public, anon;
grant execute on function public.publish_program(text, text) to authenticated;

drop policy if exists published_insert_public on public.published_programs;
drop policy if exists published_insert_own on public.published_programs;
create policy published_insert_own on public.published_programs
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and char_length(code) > 0
    and char_length(code) <= 20000
    and share_id ~ '^[a-z0-9]{8,12}$'
    and char_length(title) <= 120
  );

drop policy if exists published_delete_own on public.published_programs;
create policy published_delete_own on public.published_programs
  for delete to authenticated
  using (author_id = auth.uid());

revoke select on table public.published_programs from anon, authenticated;
grant select (share_id, code, title, created_at) on public.published_programs to anon, authenticated;
grant insert (share_id, code, title, author_id) on public.published_programs to authenticated;
grant delete on table public.published_programs to authenticated;
