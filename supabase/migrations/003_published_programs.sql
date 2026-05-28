-- KiddyFun — publish & share programs via unique link
-- Run in Supabase SQL Editor after 001 + 002

create table if not exists public.published_programs (
  id uuid primary key default gen_random_uuid(),
  share_id text not null unique,
  code text not null,
  title text not null default 'Shared Program',
  author_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint published_code_len check (char_length(code) <= 100000),
  constraint published_share_id_fmt check (share_id ~ '^[a-z0-9]{8,12}$')
);

create index if not exists published_programs_share_id_idx
  on public.published_programs (share_id);

alter table public.published_programs enable row level security;

-- Anyone can read published programs (share links are public)
drop policy if exists published_select_public on public.published_programs;
create policy published_select_public on public.published_programs
  for select to anon, authenticated
  using (true);

-- Publish via RPC only (see publish_program) — no direct insert policy

-- ── Publish (returns share_id) ───────────────────────────────────────────────
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
begin
  if p_code is null or length(trim(p_code)) = 0 then
    raise exception 'Code cannot be empty';
  end if;
  if length(p_code) > 100000 then
    raise exception 'Code is too large (max 100000 characters)';
  end if;

  v_title := coalesce(nullif(trim(p_title), ''), 'Shared Program');
  if length(v_title) > 120 then
    v_title := left(v_title, 120);
  end if;

  loop
    v_share_id := lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
    begin
      insert into public.published_programs (share_id, code, title, author_id)
      values (v_share_id, p_code, v_title, auth.uid());
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

grant execute on function public.publish_program(text, text) to anon, authenticated;

-- ── Fetch by share id ────────────────────────────────────────────────────────
create or replace function public.get_published_program(p_share_id text)
returns table (code text, title text, created_at timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select p.code, p.title, p.created_at
  from public.published_programs p
  where p.share_id = lower(trim(p_share_id))
  limit 1;
$$;

grant execute on function public.get_published_program(text) to anon, authenticated;
