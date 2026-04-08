# Cloudflare Worker OG Proxy Setup

This guide will help you set up a free workers.dev URL (e.g., `pawamore-og.workers.dev`) that serves rich social previews while keeping your URLs clean. No custom domain needed!

## How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│  Share URL: https://share.pawamore.com/products/itel-solar-gen     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  WhatsApp/Facebook/Twitter Crawler ──▶ Returns OG HTML with:       │
│    • Product image                                                  │
│    • Product name                                                   │
│    • Price: ₦45,000                                                 │
│    • Rich preview card                                              │
│                                                                     │
│  Human Click ──▶ 302 Redirect to:                                  │
│    https://pawamore.lovable.app/products/itel-solar-gen            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Step 1: Create Cloudflare Account

1. Go to [cloudflare.com](https://cloudflare.com) and sign up (free tier works)
2. You don't need to add your domain to Cloudflare DNS

## Step 2: Create the Worker

1. Go to **Workers & Pages** in the left sidebar
2. Click **Create Worker**
3. Give it a name: `pawamore-og-proxy`
4. Click **Deploy** (creates empty worker)
5. Click **Edit Code**
6. Delete all existing code
7. Paste the entire contents of `og-proxy-worker.js`
8. Click **Deploy**

## Step 3: Add Environment Variables

1. Go to your worker → **Settings** → **Variables**
2. Add these **Environment Variables**:

| Variable Name | Value |
|--------------|-------|
| `SUPABASE_URL` | `https://caxlowsbpzjuegdwdqsi.supabase.co` |
| `SUPABASE_ANON_KEY` | Your Supabase anon key (from Supabase dashboard) |
| `APP_URL` | `https://pawamore.lovable.app` |

3. Click **Save**

## Step 4: Get Your Worker URL

After deploying, your worker is available at:
```
https://pawamore-og-proxy.<your-subdomain>.workers.dev
```

Find your exact URL:
1. Go to your worker dashboard
2. Look at the **Preview** section - it shows your full URL
3. Copy this URL (e.g., `https://pawamore-og-proxy.john123.workers.dev`)

## Step 5: Add Environment Variable to Your App

Add this environment variable in your v0 project settings (click Settings icon → Vars):

| Variable Name | Value |
|--------------|-------|
| `VITE_OG_PROXY_URL` | `https://pawamore-og-proxy.<your-subdomain>.workers.dev` |

The app is already configured to use this variable. Once set, all share links will automatically use your worker URL.

## Testing

Replace `YOUR_WORKER_URL` with your actual worker URL (e.g., `https://pawamore-og-proxy.john123.workers.dev`)

### Test with curl (simulating WhatsApp):
```bash
curl -A "WhatsApp/2.0" "YOUR_WORKER_URL/products/itel-solar-gen"
```
Should return HTML with OG tags.

### Test as human:
```bash
curl -I "YOUR_WORKER_URL/products/itel-solar-gen"
```
Should return `302 Found` with `Location: https://pawamore.lovable.app/products/itel-solar-gen`

### Test in WhatsApp:
1. Send the worker URL + product path to yourself (e.g., `YOUR_WORKER_URL/products/some-product`)
2. Should show rich preview with product image, name, price
3. Click the link → opens clean pawamore.lovable.app URL

## Troubleshooting

### Preview not showing?
- WhatsApp caches previews aggressively. Add `?v=2` to the URL to bust cache
- Wait 24-48 hours for WhatsApp cache to expire

### Wrong image showing?
- Check the product has images in Supabase
- Verify `is_primary` is set on one image

### Worker error?
- Check **Logs** in your worker dashboard
- Verify environment variables are set correctly

## Cost

Cloudflare Workers free tier includes:
- 100,000 requests/day
- More than enough for social sharing

## Optional: Custom Domain Later

If you want a cleaner URL like `share.pawamore.com`, you can add a custom domain later:

1. Go to your worker → **Settings** → **Triggers**
2. Click **Add Custom Domain**
3. Enter: `share.pawamore.com`
4. Follow Cloudflare's DNS setup instructions

Then update `VITE_OG_PROXY_URL` to `https://share.pawamore.com`.
