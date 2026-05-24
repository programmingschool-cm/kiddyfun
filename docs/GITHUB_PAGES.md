# KiddyFun on GitHub Pages + secure cloud storage

GitHub Pages serves **only static files** (HTML, CSS, JS). It cannot run PHP, Node, or a database on the server. That is fine: **Supabase** (already in this project) is the standard way to add **free, secure, browser-based storage** that works 100% with `*.github.io`.

## Recommended stack

| Layer | Service | Cost |
|-------|---------|------|
| Hosting | [GitHub Pages](https://pages.github.com/) | Free |
| Database + Auth | [Supabase](https://supabase.com/) | Free tier |
| On-device cache | `localStorage` (built-in) | Free |

No extra server. No build step required.

```
User browser  →  https://you.github.io/kiddyfun/
              →  HTTPS API  →  Supabase (PostgreSQL + RLS)
```

## Why Supabase fits GitHub Pages

- Works from **any static site** over **HTTPS** (GitHub Pages provides HTTPS).
- **anon public key** in `supabase-config.js` is designed to be public; security is **Row Level Security (RLS)** in the database, not hiding the key.
- **Never** commit `service_role` key.
- Offline-first: app runs if Supabase is down; sync when online + signed in.

## Alternatives (also GitHub Pages–compatible)

| Option | Cloud sync | Teacher/class data | Notes |
|--------|------------|-------------------|--------|
| **Supabase** (this repo) | Yes | Yes (SQL) | **Recommended** |
| Firebase Firestore | Yes | Possible | More NoSQL; good but less fit for class reports |
| localStorage only | No | No | Per-browser only; no account |
| GitHub Gist / JSON file | Poor | No | Not for kid accounts; not secure |

MySQL on shared hosting, PlanetScale + your own API, PocketBase on a VPS — all need a **separate server**, not GitHub Pages alone.

## Deploy to GitHub Pages

### 1. Push the repo

Example repo: `programmingschool-cm/kiddyfun`  
Live URL: `https://programmingschool-cm.github.io/kiddyfun/`

### 2. Enable Pages

Repository → **Settings** → **Pages**:

- **Source:** Deploy from branch
- **Branch:** `main` (or `master`) → folder **`/ (root)`**  
  (because `index.html` is at repo root)

Save. After 1–3 minutes the site is live.

### 3. Configure Supabase for your `github.io` URL

1. Create project + run [`supabase/migrations/001_initial_schema.sql`](../supabase/migrations/001_initial_schema.sql)  
   (see [`SUPABASE_GUIDE.md`](SUPABASE_GUIDE.md))

2. **Authentication** → **URL Configuration**:
   - **Site URL:** `https://programmingschool-cm.github.io/kiddyfun/`
   - **Redirect URLs:** add the same URL (with and without trailing `/` if you use both)

3. **Providers:** enable **Anonymous sign-ins** (+ **Email** for parents)

4. **Settings** → **API** → copy **Project URL** and **anon public** key into  
   [`assets/js/supabase-config.js`](../assets/js/supabase-config.js):

```javascript
var base = {
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_ANON_KEY',
};
```

5. Commit and push. Users open your `github.io` link → menu → **☁️ Sync** → sign in → data syncs.

### 4. Test on the live site

- Open `https://…github.io/kiddyfun/`
- Sign in (anonymous)
- Save a program → check Supabase **Table Editor** → `programs`
- Open the same site on another device with the **same account** (use parent email link for cross-device; anonymous is per-browser unless linked)

## Security on public GitHub Pages

- **RLS** ensures each user only reads/writes their own rows (see migration SQL).
- **Minimal data:** nickname + code + progress — no phone/address in schema.
- **anon key** in a public repo is normal; protect data with RLS, not secrecy of the key.
- Use **HTTPS only** (GitHub Pages default).
- Do not add analytics trackers on kid pages (see ROADMAP Phase D1).

## What users experience

| Action | Works on github.io? |
|--------|---------------------|
| Open app, write code, run | Yes |
| Save without signing in | Yes (this browser only) |
| Sign in + cloud sync | Yes (after Supabase config) |
| Parent email magic link | Yes (redirect URL must match github.io) |
| Offline use | Yes (localStorage); sync when back online |

## Local development vs production

| Environment | URL | Use for |
|-------------|-----|---------|
| Local | `http://localhost:5500` | Testing before push |
| Production | `https://….github.io/kiddyfun/` | Students & parents |

Add `http://localhost:5500` to Supabase **Redirect URLs** for local auth tests.

## Troubleshooting

- **Sync works locally but not on github.io** → Check `supabase-config.js` is committed with real `url`/`anonKey`; hard-refresh (Ctrl+F5).
- **Magic link opens wrong page** → Fix **Site URL** / **Redirect URLs** in Supabase to exact github.io path.
- **401 / RLS errors** → User not signed in, or migration SQL not run.

Full details: [`SUPABASE_GUIDE.md`](SUPABASE_GUIDE.md)
