# Auth email templates

Supabase sends the sign-in emails, through Resend (custom SMTP). Its default emails contain only a
link, but the app's sign-in also takes the **6-digit code**, which is what makes signing in work
across devices (ask on the laptop, read the code on the phone). So both templates below include
`{{ .Token }}` (the code) and `{{ .ConfirmationURL }}` (the link).

Copy it with `pbcopy < supabase/templates/sign-in.html` (not TextEdit, which shows HTML as a formatted page) and paste it into **Supabase → Authentication → Emails → Templates** for both:

| Template | Sent when | Subject |
|---|---|---|
| **Magic Link** | an existing learner signs in | `Your Scribs & Pixels sign-in code` |
| **Confirm signup** | someone signs in for the first time | `Your Scribs & Pixels sign-in code` |

These files are the source of truth: change them here first, then paste again.
