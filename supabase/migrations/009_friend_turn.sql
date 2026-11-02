-- One snippet at a time once two or more friends are in the room.
-- The room row is locked so two sends cannot both pass the check.

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
  v_members int;
  v_last_sender uuid;
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
  where r.id = p_room_id
  for update of r;

  if not found or v_expires <= now() then
    raise exception 'This party is over';
  end if;

  select count(*) into v_members
  from public.room_members
  where room_id = p_room_id;

  if v_members >= 2 then
    select sender_id into v_last_sender
    from public.room_messages
    where room_id = p_room_id
    order by created_at desc
    limit 1;

    if v_last_sender = v_uid then
      raise exception 'Wait for a friend';
    end if;
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
