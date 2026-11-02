-- A room name is one word. Create and join both go through this function.

create or replace function public.friend_room_nickname(p_nickname text)
returns text
language plpgsql
stable
as $$
declare
  v_nick text;
begin
  v_nick := regexp_replace(coalesce(p_nickname, ''), '[[:cntrl:]]', '', 'g');
  v_nick := btrim(regexp_replace(v_nick, '[[:space:]]+', ' ', 'g'));
  v_nick := split_part(v_nick, ' ', 1);
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
