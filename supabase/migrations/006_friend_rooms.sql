-- KiddyFun Code — invite-only friend rooms (run after 001–005)
-- Kids share a short code. Story source is stored for a few hours, then deleted.
-- Clients cannot insert rows. Writes go through the functions below.

-- ── Tables ───────────────────────────────────────────────────────────────────
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  host_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '12 hours'),
  constraint rooms_code_shape check (code ~ '^[A-Z0-9]{6}$')
);

create table if not exists public.room_members (
  room_id uuid not null references public.rooms (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  nickname text not null,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id),
  constraint room_member_nick_len check (char_length(nickname) between 1 and 24)
);

create table if not exists public.room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  nickname text not null,
  code text not null,
  created_at timestamptz not null default now(),
  constraint room_message_len check (char_length(code) between 1 and 800),
  constraint room_message_nick_len check (char_length(nickname) between 1 and 24)
);

create index if not exists room_messages_room_created_idx
  on public.room_messages (room_id, created_at desc);

create index if not exists room_messages_sender_recent_idx
  on public.room_messages (room_id, sender_id, created_at desc);

comment on table public.room_messages is
  'Friend-room story code. Readable only by members, and only while the room is open.';

-- ── Helpers ──────────────────────────────────────────────────────────────────
create or replace function public.purge_expired_friend_rooms()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.rooms where expires_at <= now();
end;
$$;

revoke all on function public.purge_expired_friend_rooms() from public, anon, authenticated;

create or replace function public.friend_room_nickname(p_nickname text)
returns text
language plpgsql
stable
as $$
declare
  v_nick text;
begin
  v_nick := regexp_replace(coalesce(p_nickname, ''), '[[:cntrl:]]', '', 'g');
  v_nick := btrim(v_nick);
  if v_nick = '' then
    v_nick := 'Friend';
  end if;
  if char_length(v_nick) > 24 then
    v_nick := left(v_nick, 24);
  end if;
  return v_nick;
end;
$$;

revoke all on function public.friend_room_nickname(text) from public, anon, authenticated;

create or replace function public.friend_room_make_code()
returns text
language plpgsql
volatile
as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  out text := '';
  i int;
begin
  for i in 1..6 loop
    out := out || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return out;
end;
$$;

revoke all on function public.friend_room_make_code() from public, anon, authenticated;

-- ── Create ───────────────────────────────────────────────────────────────────
create or replace function public.create_friend_room(p_nickname text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_nick text;
  v_code text;
  v_id uuid;
  v_expires timestamptz;
  v_try int := 0;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  perform public.purge_expired_friend_rooms();
  v_nick := public.friend_room_nickname(p_nickname);

  loop
    v_code := public.friend_room_make_code();
    begin
      insert into public.rooms (code, host_id)
      values (v_code, v_uid)
      returning id, expires_at into v_id, v_expires;

      insert into public.room_members (room_id, user_id, nickname)
      values (v_id, v_uid, v_nick);

      return jsonb_build_object(
        'room_id', v_id,
        'code', v_code,
        'host_id', v_uid,
        'expires_at', v_expires,
        'nickname', v_nick
      );
    exception
      when unique_violation then
        v_try := v_try + 1;
        if v_try > 8 then
          raise exception 'Could not make a room. Try again.';
        end if;
    end;
  end loop;
end;
$$;

revoke all on function public.create_friend_room(text) from public, anon;
grant execute on function public.create_friend_room(text) to authenticated;

-- ── Join ─────────────────────────────────────────────────────────────────────
create or replace function public.join_friend_room(p_code text, p_nickname text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
  v_room public.rooms%rowtype;
  v_nick text;
  v_count int;
  v_members jsonb;
  v_messages jsonb;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  perform public.purge_expired_friend_rooms();

  v_code := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if char_length(v_code) <> 6 then
    raise exception 'Room not found';
  end if;

  select * into v_room
  from public.rooms
  where code = v_code
    and expires_at > now();

  if not found then
    raise exception 'Room not found';
  end if;

  select count(*) into v_count
  from public.room_members
  where room_id = v_room.id;

  if v_count >= 6 and not exists (
    select 1 from public.room_members
    where room_id = v_room.id and user_id = v_uid
  ) then
    raise exception 'This room is full';
  end if;

  v_nick := public.friend_room_nickname(p_nickname);

  insert into public.room_members (room_id, user_id, nickname)
  values (v_room.id, v_uid, v_nick)
  on conflict (room_id, user_id) do update
    set nickname = excluded.nickname;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'user_id', m.user_id,
      'nickname', m.nickname
    )
    order by m.joined_at
  ), '[]'::jsonb)
  into v_members
  from public.room_members m
  where m.room_id = v_room.id;

  select coalesce(jsonb_agg(to_jsonb(t) order by t.created_at), '[]'::jsonb)
  into v_messages
  from (
    select id, sender_id, nickname, code, created_at
    from (
      select id, sender_id, nickname, code, created_at
      from public.room_messages
      where room_id = v_room.id
      order by created_at desc
      limit 25
    ) recent
  ) t;

  return jsonb_build_object(
    'room_id', v_room.id,
    'code', v_room.code,
    'host_id', v_room.host_id,
    'expires_at', v_room.expires_at,
    'nickname', v_nick,
    'members', v_members,
    'messages', v_messages
  );
end;
$$;

revoke all on function public.join_friend_room(text, text) from public, anon;
grant execute on function public.join_friend_room(text, text) to authenticated;

-- ── Send ─────────────────────────────────────────────────────────────────────
create or replace function public.send_room_message(p_room_id uuid, p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_nick text;
  v_expires timestamptz;
  v_last timestamptz;
  v_recent int;
  v_id uuid;
  v_at timestamptz;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;
  if p_code is null or char_length(btrim(p_code)) = 0 then
    raise exception 'Code cannot be empty';
  end if;
  if char_length(p_code) > 800 then
    raise exception 'Code is too large';
  end if;

  select r.expires_at, m.nickname
  into v_expires, v_nick
  from public.rooms r
  join public.room_members m
    on m.room_id = r.id and m.user_id = v_uid
  where r.id = p_room_id;

  if not found or v_expires <= now() then
    raise exception 'This party is over';
  end if;

  select max(created_at) into v_last
  from public.room_messages
  where room_id = p_room_id and sender_id = v_uid;

  if v_last is not null and v_last > now() - interval '3 seconds' then
    raise exception 'Slow down a moment';
  end if;

  select count(*) into v_recent
  from public.room_messages
  where room_id = p_room_id
    and sender_id = v_uid
    and created_at > now() - interval '1 hour';

  if v_recent >= 40 then
    raise exception 'Too many messages. Take a short break.';
  end if;

  insert into public.room_messages (room_id, sender_id, nickname, code)
  values (p_room_id, v_uid, v_nick, p_code)
  returning id, created_at into v_id, v_at;

  return jsonb_build_object(
    'id', v_id,
    'room_id', p_room_id,
    'sender_id', v_uid,
    'nickname', v_nick,
    'code', p_code,
    'created_at', v_at
  );
end;
$$;

revoke all on function public.send_room_message(uuid, text) from public, anon;
grant execute on function public.send_room_message(uuid, text) to authenticated;

-- ── Close / leave ────────────────────────────────────────────────────────────
create or replace function public.close_friend_room(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_host uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select host_id into v_host
  from public.rooms
  where id = p_room_id;

  if v_host is null then
    raise exception 'This party is over';
  end if;
  if v_host <> v_uid then
    raise exception 'Only the host can close this room';
  end if;

  delete from public.rooms where id = p_room_id;
end;
$$;

revoke all on function public.close_friend_room(uuid) from public, anon;
grant execute on function public.close_friend_room(uuid) to authenticated;

create or replace function public.leave_friend_room(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_host uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select host_id into v_host
  from public.rooms
  where id = p_room_id;

  if v_host is null then
    return;
  end if;

  if v_host = v_uid then
    delete from public.rooms where id = p_room_id;
    return;
  end if;

  delete from public.room_members
  where room_id = p_room_id and user_id = v_uid;
end;
$$;

revoke all on function public.leave_friend_room(uuid) from public, anon;
grant execute on function public.leave_friend_room(uuid) to authenticated;

-- ── Read policies (members of a live room only) ──────────────────────────────
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.room_messages enable row level security;

revoke all on table public.rooms from public, anon;
revoke all on table public.room_members from public, anon;
revoke all on table public.room_messages from public, anon;

grant select on public.rooms to authenticated;
grant select on public.room_members to authenticated;
grant select on public.room_messages to authenticated;

-- Security definer so realtime SELECT checks do not re-enter room_members RLS.
create or replace function public.is_friend_room_member(p_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.room_members me
    join public.rooms r on r.id = me.room_id
    where me.room_id = p_room_id
      and me.user_id = auth.uid()
      and r.expires_at > now()
  );
$$;

revoke all on function public.is_friend_room_member(uuid) from public, anon;
grant execute on function public.is_friend_room_member(uuid) to authenticated;

drop policy if exists rooms_member_select on public.rooms;
create policy rooms_member_select on public.rooms
  for select to authenticated
  using (public.is_friend_room_member(id));

drop policy if exists room_members_select on public.room_members;
create policy room_members_select on public.room_members
  for select to authenticated
  using (public.is_friend_room_member(room_id));

drop policy if exists room_messages_select on public.room_messages;
create policy room_messages_select on public.room_messages
  for select to authenticated
  using (public.is_friend_room_member(room_id));

-- Realtime delivers inserts only when this select policy allows the row.
do $$
begin
  alter publication supabase_realtime add table public.room_messages;
exception
  when duplicate_object then
    null;
  when undefined_object then
    null;
end;
$$;
