# 🚀 Deployment Checklist - AI Product Scraper

## Prerequisites

Before deploying, ensure you have:
- [ ] Supabase project set up
- [ ] OpenAI API key
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Logged in to Supabase (`supabase login`)

---

## Step 1: Apply Database Migration

Run this command to create the `product_import_logs` table:

```bash
cd /home/rofeeq/Documents/LearnX/ne/pawamore
supabase db push
```

**Expected Output:**
```
✓ All new migrations applied successfully
```

**Verify:**
```bash
supabase db remote sql "SELECT COUNT(*) FROM product_import_logs"
```

Should return `0` (table exists but empty).

---

## Step 2: Set Environment Variables

Set the OpenAI API key in Supabase Edge Functions:

```bash
supabase secrets set OPENAI_API_KEY=sk-your-key-here
```

**Verify:**
```bash
supabase secrets list
```

Should show `OPENAI_API_KEY` (value hidden).

---

## Step 3: Deploy Edge Function

Deploy the updated scraper function:

```bash
supabase functions deploy scrape-product-from-url
```

**Expected Output:**
```
✓ Deployed scrape-product-from-url function
```

**Verify:**
```bash
supabase functions list
```

Should show `scrape-product-from-url` with status "deployed".

---

## Step 4: Deploy Frontend

Build and deploy the frontend:

```bash
npm run build
```

Then deploy the `dist/` folder to your hosting provider:

### If using Vercel:
```bash
vercel --prod
```

### If using Netlify:
```bash
netlify deploy --prod
```

### If using custom hosting:
Upload contents of `dist/` folder to your web server.

---

## Step 5: Test the Feature

1. Log in as admin
2. Go to Admin Dashboard → Products
3. Click "Import from URL"
4. Try importing from: `https://us.ecoflow.com/products/delta-pro`
5. Verify:
   - [ ] Loading progress shows
   - [ ] Preview displays with product data
   - [ ] Images show in grid
   - [ ] All fields are editable
   - [ ] Can save as draft or publish
   - [ ] Product appears in products list
   - [ ] Log entry created in `product_import_logs` table

---

## Step 6: Verify Database

Check import logs:

```bash
supabase db remote sql "SELECT id, status, source_url, created_at FROM product_import_logs ORDER BY created_at DESC LIMIT 5"
```

Should show your test import with status 'success'.

---

## Troubleshooting

### Migration fails with "relation already exists"
The table might already exist. Check with:
```bash
supabase db remote sql "SELECT table_name FROM information_schema.tables WHERE table_name = 'product_import_logs'"
```

If it exists, you can skip Step 1.

### Edge function fails to deploy
Check function logs:
```bash
supabase functions logs scrape-product-from-url --tail
```

### OpenAI errors
Verify API key is set correctly:
```bash
supabase secrets list
```

Test OpenAI key separately:
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"test"}],"max_tokens":10}'
```

### Import fails in production
Check edge function logs:
```bash
supabase functions logs scrape-product-from-url --tail
```

Look for specific error messages.

---

## Environment Variables Summary

Make sure these are set in Supabase:

| Variable | Where to Set | Value |
|----------|--------------|-------|
| `SUPABASE_URL` | Auto-set | Your Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-set | Service role key |
| `OPENAI_API_KEY` | `supabase secrets set` | Your OpenAI key |

---

## Success Criteria

✅ All checks should pass:

- [ ] Build succeeds (`npm run build`)
- [ ] Migration applied (`product_import_logs` table exists)
- [ ] Edge function deployed
- [ ] OpenAI API key set
- [ ] Frontend deployed
- [ ] Test import succeeds
- [ ] Log entry created
- [ ] Product saved to database
- [ ] Images uploaded to storage

---

## Support

If you encounter issues:

1. Check Supabase logs: `supabase functions logs scrape-product-from-url`
2. Check browser console for frontend errors
3. Check `product_import_logs` table for error messages
4. Review docs: `AI_PRODUCT_SCRAPER_IMPLEMENTATION.md`

---

## Quick Commands Reference

```bash
# Apply migration
supabase db push

# Set OpenAI key
supabase secrets set OPENAI_API_KEY=your-key

# Deploy function
supabase functions deploy scrape-product-from-url

# Check function logs
supabase functions logs scrape-product-from-url --tail

# Check database
supabase db remote sql "SELECT * FROM product_import_logs ORDER BY created_at DESC LIMIT 5"

# Build frontend
npm run build

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod
```

---

**Time to Deploy: ~10 minutes**

**Status: Ready for Production** ✅

---

*Last Updated: March 22, 2026*
