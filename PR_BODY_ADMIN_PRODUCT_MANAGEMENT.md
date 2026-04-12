Title: Admin: Bulk product management, sanitization, soft-delete, Trash UI, and review upload fixes

Summary:
This branch implements admin product bulk actions, sanitizes scraped product fields, fixes the product review image upload flow, and replaces hard-deletes with soft-deletes. It also adds a Trash tab with restore and permanent purge, plus accessibility improvements (indeterminate select-all, aria labels), and a DB migration to add deleted_at to products.

Files of interest:
- src/pages/AdminDashboard.tsx (bulk actions, indeterminate checkbox, Trash tab, purge modal, soft-delete & undo)
- src/components/ProductReviews.tsx (robust image upload and error handling)
- src/components/ui/checkbox.tsx (indeterminate styling)
- src/lib/htmlUtils.ts (sanitization helpers)
- supabase/migrations/20260412193400_add_deleted_at_to_products.sql (adds deleted_at)

Migration & deployment instructions (CI friendly):
1. Ensure CI provides one of:
   - supabase CLI (recommended) with access to your project, or
   - DATABASE_URL (Postgres connection string) for psql.
2. Export required env vars in CI:
   - DATABASE_URL (if supabase CLI isn't used)
   - VERCEL_TOKEN (optional, for vercel deploy in script)
3. Run the helper script (already added to repo):
   bash ci_apply_migrations_and_deploy.sh

Manual steps (if not using script):
- Apply migration:
  psql "$DATABASE_URL" -f supabase/migrations/20260412193400_add_deleted_at_to_products.sql
- Deploy frontend using your usual provider (Vercel, Netlify, etc.).

Post-deploy recommendations:
- Add an RLS/policy or a DB trigger to set deleted_at when status='deleted' to ensure consistent server-side behavior.
- Optionally add a scheduled job to purge items in Trash older than N days.

Suggested reviewers:
- @rofeeqshittu (owner)
- frontend maintainer(s)
- backend/DB maintainer

Notes:
- The migration only adds deleted_at; the code uses status='deleted' for soft-delete. If you prefer status to be an enum or use is_deleted boolean, modify DB and code accordingly.
- The helper script attempts to use the supabase CLI first, then falls back to psql.

If you want, I can also open a PR on GitHub now with this body and assign reviewers; confirm and provide whom to request reviews from (GitHub usernames).