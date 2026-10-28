# KiddyFun Code — Backend (Supabase)

**Chosen stack:** [Supabase](https://supabase.com) (PostgreSQL + Auth + Row Level Security). Firebase was considered; Supabase fits teacher/class relational data and CSV-style reporting better.

The app stays **offline-first**: `localStorage` is the source of truth on device; cloud sync runs when Supabase is configured and the user is signed in.

> **সম্পূর্ণ গাইডলাইন (বাংলা):** [`docs/SUPABASE_GUIDE.md`](SUPABASE_GUIDE.md) — অ্যাকাউন্ট থেকে টেস্ট, শিক্ষক/ক্লাস, নিরাপত্তা, troubleshooting।  
> **শুধু supabase.com ধাপ:** [`docs/SUPABASE_DASHBOARD_SETUP.md`](SUPABASE_DASHBOARD_SETUP.md)

## Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run migrations in order: `001_initial_schema.sql`, `002_security_hardening.sql`, `003_published_programs.sql`, `004_published_insert_policy.sql`, then [`005_production_safety.sql`](../supabase/migrations/005_production_safety.sql). Migration 005 closes public gallery inserts, forces new profiles to `student`, and limits class creation to teacher accounts. Run it on existing projects too.
3. In **Authentication → Providers**, enable:
   - **Anonymous sign-ins** (for kid-friendly one-tap sync)
   - **Email** (optional — for parent magic link)
4. Copy **Project URL** and **anon public** key from **Settings → API**.
5. The committed [`assets/js/supabase-config.js`](../assets/js/supabase-config.js) is an IIFE. It sets `window.KiddySupabaseConfig` from the project URL and publishable key, and replaces them when `window.KiddySupabaseConfigLocal` is already set.

Optional local override (not committed): copy `supabase-config.local.js.example` to `supabase-config.local.js` and load that script **before** `supabase-config.js` in `index.html`. The local file is gitignored. Do not replace the whole config file with a bare `window.KiddySupabaseConfig = { ... }` assignment or the IIFE will overwrite it.

**Never** put the `service_role` key in the frontend.

## Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Display name, role (`student` / `teacher` / `parent`), optional `class_code` |
| `programs` | Saved story code per user (`name` + `code` + `saved_at`) |
| `mission_progress` | Completed mission IDs |
| `badges` | Earned badge IDs |
| `classes` | Teacher-created class + unique `class_code` |
| `class_members` | Student ↔ class membership |
| `published_programs` | Public gallery rows (code, title, share id). `author_id` is not readable by the API. |

## Child safety

- Minimal PII: pseudonym `display_name`, optional `class_code` — no birthdate or phone in schema.
- RLS: users only read/write their own programs and progress; teachers see students in their classes.
- New sign-ups are always `role = student`. Set `teacher` in the Supabase dashboard (SQL / Table Editor). The app cannot change `role` or `class_code` except through `join_class_by_code`.
- Gallery publish requires a signed-in user, at most 20,000 characters, and at most 10 publishes an hour. The author can delete their own row.
- A magic-link sign-in starts that email's session. It does not attach the email onto the previous anonymous user.
- Signing in as a different person does not upload the previous child's local programs.

## Client modules

| File | Role |
|------|------|
| `supabase-config.js` | URL + anon key |
| `supabase-client.js` | Lazy Supabase JS client |
| `supabase-auth.js` | Sign-in UI, anonymous + email |
| `supabase-sync.js` | Push/pull merge with `storage.js` |
| `storage.js` | localStorage + calls sync when online |

## Sync behaviour

- **Save program / mission / badge:** write locally, then upsert to Supabase if signed in.
- **On sign-in (same account):** local programs push, then `pullFromCloud()` merges remote data; newer `saved_at` wins for programs.
- **On sign-in (different account):** the pending queue is dropped and this device's learning data is cleared before the new account is pulled. Nothing from the previous child is uploaded.
- **Offline:** changes stay in `localStorage`. A failed cloud write stays in `ss_sync_pending` and retries. The app shows a toast when the cloud did not save.
- **Sign out and clear this device:** removes local programs so a shared computer does not keep them.

## Teacher role (manual for now)

In Supabase **Table Editor → profiles**, set `role` to `teacher` for a staff account (the dashboard has no JWT user, so the role trigger allows it). Then insert a row into `classes`. Students join with the class code from the Sync panel. The in-app Teacher panel exports progress from this device only. Its displayed code is not a cloud class.
