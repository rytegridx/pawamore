#!/usr/bin/env bash
set -euo pipefail

echo "== Apply DB migrations & deploy (CI helper) =="

# Try Supabase CLI first
if command -v supabase >/dev/null 2>&1; then
  echo "Found supabase CLI — running migrations"
  # Use migration runner if available, otherwise fallback to db push
  if supabase migration run --help >/dev/null 2>&1; then
    supabase migration run
  else
    supabase db push
  fi
else
  # Fallback: apply raw SQL files using psql and DATABASE_URL
  if [ -z "${DATABASE_URL:-}" ]; then
    echo "ERROR: supabase CLI not found and DATABASE_URL is not set. Cannot apply migrations."
    exit 1
  fi
  echo "Applying SQL migrations from supabase/migrations/..."
  for f in $(ls supabase/migrations/*.sql | sort); do
    echo "Applying: $f"
    psql "$DATABASE_URL" -f "$f"
  done
fi

# Build
echo "Installing dependencies and building..."
npm ci --silent
npm run build --silent

# Try Vercel deployment if token/cli present
if command -v vercel >/dev/null 2>&1 && [ -n "${VERCEL_TOKEN:-}" ]; then
  echo "Deploying with Vercel..."
  vercel --prod --token "$VERCEL_TOKEN" --confirm
else
  echo "Vercel CLI not available or VERCEL_TOKEN not set. Build finished. Please deploy with your CI provider."
fi

echo "== Done =="
