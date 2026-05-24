# Supabase email templates — KiddyFun / Programming School

## Magic Link (parent sign-in)

### Where to paste

1. [Supabase Dashboard](https://supabase.com/dashboard) → your project  
2. **Authentication** → **Email Templates**  
3. Select **Magic Link**

### Subject line

Copy from [`magic-link-subject.txt`](magic-link-subject.txt):

```
Sign in to KiddyFun Code — Programming School
```

### Body (HTML)

1. Open [`magic-link.html`](magic-link.html)  
2. Copy **only** the HTML inside the file (from `<!DOCTYPE html>` through `</html>`)  
3. Paste into the **Message body** field (use **Source** / HTML mode if the editor has tabs)  
4. Keep the variable exactly as: `{{ .ConfirmationURL }}`  
5. **Save**

### Preview

Use **Send test email** in Supabase (if available) or trigger sign-in from the live app → **☁️ Sync** → parent email.

### Brand colors (reference)

| Use | Hex |
|-----|-----|
| Primary green | `#10b981` |
| Dark text | `#0f172a` |
| Muted text | `#64748b` |
| Background | `#f1f5f9` |

### Optional: Confirm signup template

If you enable **Confirm email** for new signups, reuse the same HTML and change the heading to “Confirm your email” and the button text to “Confirm email address”. The variable remains `{{ .ConfirmationURL }}`.
