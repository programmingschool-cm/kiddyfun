-- KiddyFun Code — initial Supabase schema + RLS
-- Run once in Supabase SQL Editor (Dashboard → SQL → New query)

-- ── Profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'student'
    check (role in ('student', 'teacher', 'parent')),
  class_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_profiles_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', 'Kiddy Coder'),
    coalesce(new.raw_user_meta_data ->> 'role', 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Programs ──────────────────────────────────────────────────────────────────
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  code text not null default '',
  saved_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

drop trigger if exists programs_updated_at on public.programs;
create trigger programs_updated_at
  before update on public.programs
  for each row execute function public.set_profiles_updated_at();

-- ── Mission progress ──────────────────────────────────────────────────────────
create table if not exists public.mission_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mission_id text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, mission_id)
);

-- ── Badges ───────────────────────────────────────────────────────────────────
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  badge_id text not null,
  awarded_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

-- ── Classes (teacher) ─────────────────────────────────────────────────────────
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  class_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.class_members (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (class_id, student_id)
);

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.mission_progress enable row level security;
alter table public.badges enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;

-- Profiles: own row
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Teachers may read student profiles in their classes
drop policy if exists profiles_teacher_read_class on public.profiles;
create policy profiles_teacher_read_class on public.profiles
  for select using (
    exists (
      select 1 from public.classes c
      where c.teacher_id = auth.uid()
        and c.class_code = profiles.class_code
    )
  );

-- Programs
drop policy if exists programs_own on public.programs;
create policy programs_own on public.programs
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Mission progress
drop policy if exists mission_progress_own on public.mission_progress;
create policy mission_progress_own on public.mission_progress
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Badges
drop policy if exists badges_own on public.badges;
create policy badges_own on public.badges
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Classes: teacher owns
drop policy if exists classes_teacher_all on public.classes;
create policy classes_teacher_all on public.classes
  for all using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

-- Students can read class row by code (to validate join)
drop policy if exists classes_student_read_by_code on public.classes;
create policy classes_student_read_by_code on public.classes
  for select using (
    class_code = (
      select p.class_code from public.profiles p where p.id = auth.uid()
    )
  );

-- Class members: student sees own; teacher sees class roster
drop policy if exists class_members_student_own on public.class_members;
create policy class_members_student_own on public.class_members
  for select using (auth.uid() = student_id);

drop policy if exists class_members_student_insert on public.class_members;
create policy class_members_student_insert on public.class_members
  for insert with check (
    auth.uid() = student_id
    and exists (
      select 1 from public.classes c
      join public.profiles p on p.id = auth.uid()
      where c.class_code = p.class_code
        and c.id = class_id
    )
  );

drop policy if exists class_members_teacher_read on public.class_members;
create policy class_members_teacher_read on public.class_members
  for select using (
    exists (
      select 1 from public.classes c
      where c.id = class_members.class_id
        and c.teacher_id = auth.uid()
    )
  );

-- ── Join class helper (student sets class_code + membership) ─────────────────
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

  update public.profiles
  set class_code = upper(trim(p_class_code)), updated_at = now()
  where id = v_uid;

  insert into public.class_members (class_id, student_id)
  values (v_class_id, v_uid)
  on conflict (class_id, student_id) do nothing;
end;
$$;

grant execute on function public.join_class_by_code(text) to authenticated;
