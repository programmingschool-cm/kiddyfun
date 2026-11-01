-- Friend-room realtime was silent.
-- room_messages SELECT joined room_members, and that policy joined
-- room_members again, so the realtime check never allowed the new row.
-- Refresh still worked because join_friend_room is security definer.
-- Run this on a project that already applied 006.

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
