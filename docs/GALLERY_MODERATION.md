# Gallery Moderation Workflow

## Publishing

1. User clicks **Publish** → code saved to `published_programs` (Supabase) or offline link `?z=`
2. Gallery lists recent public entries (`gallery.js`)

## Moderation (recommended)

| Step | Action |
|------|--------|
| 1 | Teacher reviews gallery weekly in Supabase dashboard |
| 2 | Remove rows with inappropriate title/code |
| 3 | Disable publish RLS for repeat offenders (dashboard policy) |
| 4 | Report button (future): flag `share_id` for review |

## Kid safety rules

- No personal phone numbers or addresses in shared code
- No offensive language in `says` strings
- Stories should use built-in characters and scenes

## Remix

- `?p=id&remix=1` loads code as new draft — not auto-published

*Update when automated moderation ships (Phase C2).*
