# Lovable Runbook: Deploy and Run Bulk iTel Product Import

This file is for automation agents (Lovable/Copilot) to deploy and run the bulk scraper pipeline.

## Goal

Deploy the latest scraper updates, then import products from `https://itelsolar.com/` in batches (for example 10 at once) into the PawaMore products backend.

---

## 1) Required secrets (do NOT commit values)

Set these in the runtime environment:

- `SUPABASE_ACCESS_TOKEN` (Supabase Personal Access Token)
- Admin user JWT (for direct function-call testing only)

> Never hardcode PAT/JWT in code or commit history.

---

## 2) Deploy migration + edge function

Run from repo root:

```bash
supabase link --project-ref ijmhkuenipllgbotltyx
supabase db push
supabase functions deploy scrape-product
```

Expected outcome:
- migration applied (adds source fields for imported products)
- `scrape-product` deployed successfully

---

## 3) Trigger bulk import (direct API option)

```bash
curl -X POST "https://ijmhkuenipllgbotltyx.supabase.co/functions/v1/scrape-product" \
  -H "Authorization: Bearer <ADMIN_USER_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://itelsolar.com/","mode":"site","batch_size":10}'
```

Notes:
- `mode: "site"` crawls listing/sitemap and imports multiple product pages.
- `batch_size` range is `1..20`.
- Response includes success/failure summary per URL.

---

## 4) Run from app admin dashboard (UI option)

After deploy:

1. Open **Admin Dashboard → Scraper** tab
2. Select **Site Bulk Import**
3. URL: `https://itelsolar.com/`
4. Batch size: `10`
5. Click **Scrape Product**

The run status appears in `scraper_runs`.

---

## 5) What this import now saves

For each imported product:

- Product core fields (`name`, `price`, `description`, etc.)
- Brand/category auto resolve-create
- Product images (uploaded to Supabase Storage when possible)
- Source tracking fields:
  - `products.source_url`
  - `products.product_type`
  - `products.source_metadata` (extra unmapped source fields)

---

## 6) Quick troubleshooting

- If deploy fails with auth error: set `SUPABASE_ACCESS_TOKEN` and rerun.
- If no products discovered: use direct `/product/...` URL with `mode:"single"`.
- If some URLs fail: rerun with smaller batch (e.g. `5`) and inspect `scraper_runs.error_message`.
