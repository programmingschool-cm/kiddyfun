-- Allow publish fallback insert when RPC cache is stale (optional backup path)
drop policy if exists published_insert_public on public.published_programs;
create policy published_insert_public on public.published_programs
  for insert to anon, authenticated
  with check (
    char_length(code) > 0
    and char_length(code) <= 100000
    and share_id ~ '^[a-z0-9]{8,12}$'
    and char_length(title) <= 120
  );
