# Supabase.com — সম্পূর্ণ সেটআপ চেকলিস্ট (KiddyFun + GitHub Pages)

এই ডকুমেন্ট **শুধু supabase.com ড্যাশবোর্ডে** আপনি কী করবেন, তার ধাপে ধাপে তালিকা।  
প্রজেক্ট অডিট ও নিরাপত্তা সারাংশ নিচে **§0**-এ।

**লাইভ সাইট (উদাহরণ):** `https://programmingschool-cm.github.io/kiddyfun/`

---

## §0 — অডিট: প্রজেক্টে কী আছে, নিরাপত্তা

### ডেটাবেস (মাইগ্রেশন)

| ফাইল | চালাতে হবে | বিষয়বস্তু |
|------|------------|------------|
| [`001_initial_schema.sql`](../supabase/migrations/001_initial_schema.sql) | **১ম** | ৬ টেবিল, RLS, `handle_new_user`, `join_class_by_code` |
| [`002_security_hardening.sql`](../supabase/migrations/002_security_hardening.sql) | **২য়** | `role` পরিবর্তন API থেকে বন্ধ, ইনডেক্স |

### টেবিল ↔ অ্যাপ ম্যাপিং

| Supabase টেবিল | KiddyFun ডেটা | অ্যাপ থেকে |
|----------------|---------------|------------|
| `profiles` | nickname, role, class | Sign-in, Join class |
| `programs` | সেভ করা কোড | `SpeakStorage.saveProgram` |
| `mission_progress` | মিশন সম্পন্ন | `completeMission` |
| `badges` | ব্যাজ | `awardBadge` |
| `classes` | শিক্ষকের ক্লাস | SQL/Dashboard (UI পরে) |
| `class_members` | রোস্টার | `join_class_by_code` RPC |

**ক্লাউডে যায় না (ইচ্ছেকৃত):** শেষ লেখা কোড (`ss_last_code`) — শুধু `localStorage`।

### নিরাপত্তা (RLS) — যা ঠিক আছে

- সব পাবলিক টেবিলে **RLS enabled**
- `programs` / `mission_progress` / `badges`: শুধু `user_id = auth.uid()`
- `profiles`: নিজের row পড়া/আপডেট; শিক্ষক শুধু নিজের ক্লাসের `class_code` মিলে শিক্ষার্থী দেখে
- `classes`: শুধু `teacher_id = auth.uid()` দিয়ে CRUD
- `join_class_by_code`: **SECURITY DEFINER** — শুধু বৈধ কোডে জয়েন
- **002:** শিক্ষার্থী API দিয়ে `role = teacher` করতে পারবে না

### আপনার দায়িত্ব (Supabase Dashboard)

- শুধু **anon public** key ফ্রন্টএন্ডে; **service_role কখনো নয়**
- শিক্ষকের `role = teacher` **Table Editor / SQL** দিয়ে (অ্যাপ দিয়ে নয়)
- Redirect URL ঠিক GitHub Pages URL

### পরিচিত সীমা (পাইলটের জন্য গ্রহণযোগ্য)

- Anonymous অ্যাকাউন্ট **প্রতি ব্রাউজারে আলাদা** — এক ডিভাইস থেকে অন্যটিতে parent email লিংক লাগে
- টিচার UI অ্যাপে নেই — ক্লাস SQL দিয়ে তৈরি
- `class_code` অনুমান করা theoretically সম্ভব — শক্তিশালী র্যান্ডম কোড ব্যবহার করুন

---

## ধাপ ১ — প্রজেক্ট তৈরি

1. [https://supabase.com/dashboard](https://supabase.com/dashboard) → লগইন
2. **New project**
3. **Name:** `kiddyfun-code` (যেকোনো)
4. **Database password:** সংরক্ষণ করুন
5. **Region:** `Southeast Asia (Singapore)` (বাংলাদেশের কাছে)
6. **Create new project** → সবুজ/active হওয়া পর্যন্ত অপেক্ষা

---

## ধাপ ২ — SQL মাইগ্রেশন (সবচেয়ে গুরুত্বপূর্ণ)

### 2.1 প্রথম মাইগ্রেশন

1. বাম মেনু → **SQL Editor**
2. **+ New query**
3. লোকাল ফাইল খুলুন: `supabase/migrations/001_initial_schema.sql`
4. **সম্পূর্ণ** কপি → পেস্ট → **Run** (নিচে Success)

### 2.2 নিরাপত্তা প্যাচ

1. আবার **New query**
2. `supabase/migrations/002_security_hardening.sql` কপি → **Run**

### 2.3 যাচাই

**Table Editor**-এ ৬টি টেবিল:

- `profiles`, `programs`, `mission_progress`, `badges`, `classes`, `class_members`

**Database** → **Policies** (বা Table → RLS): প্রতি টেবিলে policies দেখা যাচ্ছে কিনা।

**Database** → **Functions**: `join_class_by_code`, `handle_new_user` আছে কিনা।

---

## ধাপ ৩ — Authentication

বাম মেনু → **Authentication**

### 3.1 Providers

**Authentication** → **Providers**:

| Provider | সেটিং |
|----------|--------|
| **Anonymous sign-ins** | **Enable** (শিশু one-tap sync) |
| **Email** | **Enable** (অভিভাবক magic link) |

অন্য provider (Google, GitHub) **বন্ধ** রাখুন — শিশু অ্যাপে দরকার নেই।

### 3.2 URL Configuration

**Authentication** → **URL Configuration**:

| ফিল্ড | মান |
|-------|-----|
| **Site URL** | `https://programmingschool-cm.github.io/kiddyfun/` |
| **Redirect URLs** | একই URL যোগ করুন |
| | `https://programmingschool-cm.github.io/kiddyfun/index.html` |
| | (লোকাল টেস্ট) `http://localhost:5500` |
| | `http://localhost:5500/index.html` |

**Save**

### 3.3 Email টেমপ্লেট (Programming School ব্র্যান্ডেড)

**Authentication** → **Email Templates** → **Magic Link**

| ফিল্ড | ফাইল |
|-------|------|
| **Subject** | [`supabase/email-templates/magic-link-subject.txt`](../supabase/email-templates/magic-link-subject.txt) |
| **Body (HTML)** | [`supabase/email-templates/magic-link.html`](../supabase/email-templates/magic-link.html) — পুরো HTML কপি করে Body-তে পেস্ট করুন |

`{{ .ConfirmationURL }}` অপরিবর্তিত রাখুন। বিস্তারিত: [`supabase/email-templates/README.md`](../supabase/email-templates/README.md)

### 3.4 Confirm email (পাইলট)

**Authentication** → **Providers** → **Email**:

- দ্রুত টেস্ট: **Confirm email** বন্ধ
- প্রডাকশন: চালু রাখুন

---

## ধাপ ৪ — Project URL ও API কী কপি করা

> **মনে রাখুন:** ২০২৫–২০২৬ Supabase UI-তে পুরনো মেনু **Settings → API** আর নেই। এখন **API Keys** বা উপরের **Connect** বাটন ব্যবহার করুন।

### পদ্ধতি A — সবচেয়ে সহজ: **Connect** বাটন

1. প্রজেক্ট ড্যাশবোর্ডে (বামে **Home** / Overview) উপরে ডানদিকে **Connect** ক্লিক করুন  
   *(কখনো **Connect to your project** লেখা থাকে)*
2. **App Frameworks** বা **JavaScript** ট্যাব বেছে নিন
3. সেখানে দেখবেন:
   - **Project URL** — যেমন `https://abcdefgh.supabase.co`
   - **API Key** — `sb_publishable_...` **অথবা** `anon` (দীর্ঘ `eyJ...` JWT)
4. দুটোই কপি করুন

### পদ্ধতি B — Settings → **API Keys**

1. বাম নিচে **Project Settings** (⚙️ গিয়ার আইকন) — **Project Settings**, Account Settings নয়
2. বাম সাইডবারে **API Keys** ক্লিক করুন *(পুরনো নাম “API” নয়)*
3. **API Keys** ট্যাবে:
   - **Publishable key** → `sb_publishable_...` — এটাই `anonKey`-তে বসান ✅
4. **Project URL** এই পেজের উপরে বা **Connect** ডায়ালগে থাকে  
   না পেলে **General** সেটিংসে **Reference ID** দেখুন → URL বানান:

   ```
   https://[REFERENCE-ID].supabase.co
   ```

   উদাহরণ: Reference ID = `abcdefghijklmnop`  
   → URL = `https://abcdefghijklmnop.supabase.co`

### পদ্ধতি C — **Legacy** anon key (JWT)

KiddyFun `@supabase/supabase-js` দুটোই সাপোর্ট করে। যদি শুধু `eyJ...` key চান:

1. **Project Settings** → **API Keys**
2. ট্যাব **Legacy API Keys** (বা **Legacy anon, service_role**)
3. **anon** `public` — দীর্ঘ `eyJhbGciOiJIUzI1NiIs...` কপি → `anonKey`

| কপি করুন | দেখতে কেমন | `supabase-config.js` |
|----------|-------------|----------------------|
| **Project URL** | `https://xxxx.supabase.co` | `url` |
| **Publishable** | `sb_publishable_...` | `anonKey` ✅ প্রথম পছন্দ |
| **anon (legacy)** | `eyJhbGciOiJIUzI1NiIs...` | `anonKey` ✅ এটাও চলে |

**কখনো কপি করবেন না:** `service_role`, `sb_secret_...`, **Secret** keys

### খুঁজে পাচ্ছেন না? চেকলিস্ট

| সমস্যা | সমাধান |
|--------|---------|
| শুধু Account Settings দেখছি | প্রজেক্ট **ভিতরে** ঢুকুন (বামে Database, Auth দেখা যাবে) |
| API Keys মেনু নেই | উপরে **Connect** ব্যবহার করুন |
| প্রজেক্ট এখনো building | ১–২ মিনিট অপেক্ষা; পেজ রিফ্রেশ |
| Free project paused | Dashboard → **Restore project** |

অফিসিয়াল ডক: [Supabase API Keys](https://supabase.com/docs/guides/api/api-keys)

---

## ধাপ ৫ — GitHub প্রজেক্টে কী বসান

[`assets/js/supabase-config.js`](../assets/js/supabase-config.js) এডিট:

```javascript
var base = {
  url: 'https://xxxxxxxx.supabase.co',
  // যেকোনো একটি — Publishable (নতুন) অথবা anon JWT (legacy)
  anonKey: 'sb_publishable_xxxxxxxx',
  // anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};
```

Git commit + push → GitHub Pages আপডেট (১–৩ মিনিট)।

---

## ধাপ ৬ — GitHub Pages (যদি এখনো না করে থাকেন)

GitHub রিপো → **Settings** → **Pages**:

- **Branch:** `main`
- **Folder:** `/ (root)`
- Save

URL: `https://<user>.github.io/<repo>/`

---

## ধাপ ৭ — লাইভ সাইটে টেস্ট

1. `https://programmingschool-cm.github.io/kiddyfun/` খুলুন (Ctrl+F5)
2. মেনু ☰ → উপরে স্ট্যাটাস: `Sign in to sync` (কী ঠিক থাকলে)
3. **☁️ Sync** → nickname → **Start syncing (one tap)**
4. কোড লিখে **💾 Save**
5. Supabase → **Table Editor** → `programs` → নতুন row
6. **↻ Sync now** — error নেই

### Browser Console (F12)

- ভালো: `[KiddyFun] Storage ready (cloud configured)`
- খারাপ: `401` / `RLS` → মাইগ্রেশন বা সাইন-ইন চেক করুন

---

## ধাপ ৮ — শিক্ষক ও ক্লাস (ঐচ্ছিক)

### 8.1 শিক্ষক অ্যাকাউন্ট

1. লাইভ সাইটে **Parent → Email magic link** দিয়ে লগইন
2. **Authentication** → **Users** → UUID কপি
3. **Table Editor** → `profiles` → সেই row → `role` = `teacher` (ম্যানুয়াল)

### 8.2 ক্লাস তৈরি (SQL Editor)

```sql
insert into public.classes (teacher_id, name, class_code)
values (
  'TEACHER-UUID-HERE',
  'Class 3A',
  'SUNNY-42'
);
```

### 8.3 শিক্ষার্থী জয়েন

অ্যাপ → **☁️ Sync** → সাইন-ইন → Class code `SUNNY-42` → **Join**

যাচাই:

```sql
select * from public.class_members;
```

---

## ধাপ ৯ — নিরাপত্তা চেকলিস্ট (Dashboard)

- [ ] মাইগ্রেশন **001** + **002** দুটোই Run হয়েছে
- [ ] Table Editor-এ RLS **enabled** (প্রতি টেবিল)
- [ ] Anonymous + Email চালু
- [ ] Redirect URLs = GitHub Pages URL
- [ ] `service_role` key রিপোতে নেই
- [ ] শিক্ষক `role` শুধু Dashboard/SQL দিয়ে

**Authentication** → **Settings** → Rate limits — ডিফল্ট রাখুন।

---

## সমস্যা → কারণ

| লক্ষণ | সমাধান |
|--------|---------|
| Enable Anonymous auth | Providers → Anonymous ON |
| RLS policy violation | 001 SQL আবার Run; সাইন-ইন করুন |
| Magic link wrong page | Site URL / Redirect URLs ঠিক করুন |
| programs খালি | সাইন-ইন ছাড়া সেভ → শুধু localStorage |
| Class not found | `classes` টেবিলে row আছে কিনা |

বিস্তারিত: [`SUPABASE_GUIDE.md`](SUPABASE_GUIDE.md)

---

## দ্রুত ক্রম (কপি-পেস্ট তালিকা)

```
□ Supabase New project
□ SQL: 001_initial_schema.sql → Run
□ SQL: 002_security_hardening.sql → Run
□ Auth: Anonymous ON, Email ON
□ Auth URL: github.io/kiddyfun + localhost
□ API: copy URL + anon key → supabase-config.js
□ Git push → GitHub Pages
□ Live site: Sync → Save → check programs table
```

---

*KiddyFun Code · Programming School — Cumilla*
