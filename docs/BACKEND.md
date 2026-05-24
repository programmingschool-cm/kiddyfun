# KiddyFun Code — Backend (Supabase)

**Chosen stack:** [Supabase](https://supabase.com) (PostgreSQL + Auth + Row Level Security). Firebase was considered; Supabase fits teacher/class relational data and CSV-style reporting better.

The app stays **offline-first**: `localStorage` is the source of truth on device; cloud sync runs when Supabase is configured and the user is signed in.

> **সম্পূর্ণ গাইডলাইন (বাংলা):** [`docs/SUPABASE_GUIDE.md`](SUPABASE_GUIDE.md) — অ্যাকাউন্ট থেকে টেস্ট, শিক্ষক/ক্লাস, নিরাপত্তা, troubleshooting।  
> **শুধু supabase.com ধাপ:** [`docs/SUPABASE_DASHBOARD_SETUP.md`](SUPABASE_DASHBOARD_SETUP.md)

## Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run migrations in order: [`001_initial_schema.sql`](../supabase/migrations/001_initial_schema.sql) then [`002_security_hardening.sql`](../supabase/migrations/002_security_hardening.sql).
3. In **Authentication → Providers**, enable:
   - **Anonymous sign-ins** (for kid-friendly one-tap sync)
   - **Email** (optional — for parent magic link)
4. Copy **Project URL** and **anon public** key from **Settings → API**.
5. Edit [`assets/js/supabase-config.js`](../assets/js/supabase-config.js):

```javascript
window.KiddySupabaseConfig = {
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_ANON_KEY',
};
```

Optional local override (not committed): copy `supabase-config.local.js.example` to `supabase-config.local.js`.

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

## Child safety

- Minimal PII: pseudonym `display_name`, optional `class_code` — no birthdate or phone in schema.
- RLS: users only read/write their own programs and progress; teachers see students in their classes.
- Anonymous accounts can be upgraded later via email (parent flow).

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
- **On sign-in:** `pullFromCloud()` merges remote data; newer `saved_at` wins for programs.
- **Offline:** changes stay in `localStorage`; sync runs on next successful auth + `online` event.

## Teacher role (manual for now)

In Supabase **Table Editor → profiles**, set `role` to `teacher` for a staff account, then use SQL or dashboard to insert into `classes`. A teacher UI is planned in ROADMAP Phase C1.
