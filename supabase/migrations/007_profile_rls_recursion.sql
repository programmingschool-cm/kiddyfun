-- Stop profiles SELECT from returning 500.
-- Policies that read public.profiles while protecting public.profiles
-- recurse until Postgres aborts. PostgREST shows that as 500.
-- Run this on a project that already applied 001–006.

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

drop policy if exists classes_teacher_all on public.classes;
create policy classes_teacher_all on public.classes
  for all
  using (auth.uid() = teacher_id and public.current_user_role() = 'teacher')
  with check (auth.uid() = teacher_id and public.current_user_role() = 'teacher');

drop policy if exists classes_student_read_by_code on public.classes;
create policy classes_student_read_by_code on public.classes
  for select using (class_code = public.current_user_class_code());

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

drop policy if exists class_members_student_insert on public.class_members;
create policy class_members_student_insert on public.class_members
  for insert with check (
    auth.uid() = student_id
    and exists (
      select 1 from public.classes c
      where c.class_code = public.current_user_class_code()
        and c.id = class_id
    )
  );
