# Privacy & Child Safety (KiddyFun Code)

## Data we store

| Data | Where | Purpose |
|------|-------|---------|
| Code, missions, badges, lessons, XP | `localStorage` on this device | Learning progress |
| Optional cloud sync | Supabase, after sign-in | The same progress on another device |
| Nickname | Supabase `profiles` | What the teacher sees in a class |
| Parent email | Supabase Auth, only if a parent asks for a magic link | Sign-in. There is no age check in the app. |
| Speech practice counts | `localStorage` only | How many repeat-after-me tries succeeded |
| Published program | Supabase `published_programs` | A public gallery link. The code can be read by anyone with the link or the gallery. |
| Friend room | Supabase `rooms`, `room_members`, `room_messages` | A private room for a fun nickname and short story code. It opens only with the code or link. The room and its stories are deleted after 12 hours, or sooner if the host closes it. |

## What leaves this device

- **Cloud sync and gallery** go to the Supabase project configured in `assets/js/supabase-config.js`.
- **Repeat after me** uses the browser speech API. In Chrome that audio is processed by Google. This app does not save the recording. There is no separate parent permission screen.
- **Fonts and app icons** are local. The page does not load Google Fonts or placeholder-image hosts.
- The Supabase browser library is loaded from jsDelivr (with a fixed checksum).

## What we do not do

- No public chat. Friend rooms are invite-only (a code or link), hold at most six people, and expire after 12 hours. They are not listed anywhere.
- No ad trackers
- No sale of children's data

## Sharing and accounts

- A share link loads code into the editor. It does not run until someone presses Run.
- A friend-room link (`?room=`) joins a private room. Stories in that room play on the stage. The room is not a public chat.
- Publishing to the gallery requires sign-in. The author can unpublish from the gallery on this device.
- Sign out keeps local programs. **Sign out and clear this device** deletes them so the next child on a shared computer does not see them.
- Signing in as a different account does not upload the previous child's programs.
- Reset on this device is separate from deleting cloud copies.
- Deleting the Supabase auth user itself is not a button in the app. A parent asks the school to remove that account in the Supabase dashboard.

## Parent / teacher

- Progress export: Teacher panel → CSV (this device)
- Parent summary: menu → Parent
- Short version in the app: menu → Privacy

## Checklist

- [x] Nickname instead of a legal name by default
- [x] Parent email is optional
- [x] Local-first; cloud is optional
- [x] Gallery write requires a signed-in author; public insert is closed in migration 005
- [x] In-app privacy panel (menu → Privacy)
- [ ] School-hosted legal privacy page, and a way for a parent to delete the auth account without the dashboard
- [ ] Parent permission step before the microphone is used

## Gallery

Published programs are public. See [GALLERY_MODERATION.md](./GALLERY_MODERATION.md).

*Programming School — Cumilla*
