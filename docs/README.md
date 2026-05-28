# KiddyFun Code — Documentation

| Document | Description |
|----------|-------------|
| **[TUTORIAL.md](./TUTORIAL.md)** | **Complete language tutorial** — syntax, keywords, rules, examples, learning path |
| [LANGUAGE.md](./LANGUAGE.md) | One-page quick reference |
| [SUPABASE_GUIDE.md](./SUPABASE_GUIDE.md) | Cloud sync & database setup |
| [SUPABASE_DASHBOARD_SETUP.md](./SUPABASE_DASHBOARD_SETUP.md) | Step-by-step Supabase dashboard |
| [GITHUB_PAGES.md](./GITHUB_PAGES.md) | Deploy on GitHub Pages |
| [BACKEND.md](./BACKEND.md) | Backend overview |

**শিক্ষকদের জন্য:** সম্পূর্ণ ভাষা শেখানোর গাইড → [TUTORIAL.md](./TUTORIAL.md) (also in app: **☰ Menu → 📘 Tutorial**)

## Start here for game building

If you want to build games by yourself, follow this order:

1. [TUTORIAL.md](./TUTORIAL.md) sections **28–31** (Game quick start, side-view steps, top-down steps, debug checklist)
2. [LANGUAGE.md](./LANGUAGE.md) game-mode quick reference
3. In-app **Examples**: **Platform Jump** then **Coin Collector**
4. [GAME_ENGINE.md](./GAME_ENGINE.md) for deeper engine behavior

After editing `TUTORIAL.md`, refresh the in-app copy:

```bash
node scripts/build-tutorial-content.js
```
