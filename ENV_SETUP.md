# Environment Variables Setup Guide

## Overview

Tomagotree uses environment variables to configure the application. This guide explains the difference between `.env.example` and `.env.local`, and which secrets are actually secret.

## Files Explained

### `.env.example` ✅ Committed to Git
- **Purpose**: Template showing what variables are needed
- **Contains**: Variable names and example/fake values
- **Safe for**: Public repos, documentation, onboarding new developers

### `.env.local` ❌ NOT Committed (Ignored by Git)
- **Purpose**: Your actual credentials for local development
- **Contains**: Real API keys, database URLs, secrets
- **Protected by**: `.gitignore` (already configured)

### `.env` ❌ NOT Committed (Ignored by Git)
- **Legacy file** - replaced by `.env.local`
- You can delete the old `.env` file now

## Setup Instructions

### For New Developers

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd Tomagotree
   ```

2. **Copy the example file**
   ```bash
   cp .env.example .env.local
   ```

3. **Fill in real values** in `.env.local`
   - Get Supabase credentials from project settings
   - Leave optional variables commented out unless needed

4. **Start development**
   ```bash
   npm run dev
   ```

## What's Public vs Private?

### ✅ Safe to Expose (Public Variables)

These are **designed** to be public and are protected by other security measures:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...  # The "anon" key
VITE_APP_NAME=Tomagotree
VITE_DEFAULT_LATITUDE=35.9940
VITE_MAP_TILE_URL=https://...
```

**Why?**
- All `VITE_*` variables are exposed to the browser (that's how Vite works)
- Supabase's "anon/publishable" key is protected by Row Level Security (RLS)
- Everyone accessing your website sees these values anyway
- They're useless without proper RLS policies

### ❌ NEVER EXPOSE (Private Variables)

These bypass security and should **NEVER** be in frontend code:

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # ⚠️ Bypasses ALL security!
SUPABASE_DB_URL=postgresql://postgres:password@...
```

**Why?**
- Service role key has admin access to everything
- Database URL has direct Postgres access
- These should only live in backend/serverless functions

## Vite vs Next.js Naming

| Framework | Browser Variables | Server Variables |
|-----------|------------------|------------------|
| **Vite** (You) | `VITE_*` | No prefix (rare) |
| Next.js | `NEXT_PUBLIC_*` | No prefix |

## How Supabase Security Works

```
┌─────────────────────────────────────────────────┐
│  Frontend (Browser)                             │
│  ✅ Has: VITE_SUPABASE_PUBLISHABLE_KEY         │
│  ❌ Does NOT have: SERVICE_ROLE_KEY            │
└──────────────────┬──────────────────────────────┘
                   │
                   │ Makes API calls with anon key
                   ▼
┌─────────────────────────────────────────────────┐
│  Supabase API                                   │
│  Checks: Row Level Security (RLS) policies      │
│  - Can user see this row?                       │
│  - Can user edit this row?                      │
│  - Is user authenticated?                       │
└─────────────────────────────────────────────────┘
```

**Your RLS policies** (from migration file):
- Users can only see/edit their own trees
- Users can only see/edit their own tasks
- Profiles are public (read-only)
- Neighborhoods are public

The "anon" key is just an identifier - RLS does the actual security.

## Feature Flags

Use these to enable/disable features during development:

```bash
VITE_ENABLE_PHOTO_UPLOAD=false
VITE_ENABLE_NEIGHBORHOODS=false
VITE_ENABLE_HEAT_MAP=false
```

Access in code:
```typescript
if (import.meta.env.VITE_ENABLE_PHOTO_UPLOAD === 'true') {
  // Show photo upload UI
}
```

## Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **service_role key** (optional, BE CAREFUL) → `SUPABASE_SERVICE_ROLE_KEY`

## Production Deployment

When deploying to Vercel/Netlify/etc:

1. **DO NOT** commit `.env.local`
2. **DO** commit `.env.example`
3. **DO** add environment variables in the hosting platform's dashboard
4. Use the same variable names from `.env.example`

### Vercel Example
```bash
Project Settings → Environment Variables
→ Add: VITE_SUPABASE_URL = https://...
→ Add: VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGc...
```

## Troubleshooting

### "Cannot find VITE_SUPABASE_URL"
- Make sure `.env.local` exists
- Restart dev server (`npm run dev`)
- Variables are only loaded at build time, not runtime

### "Access denied" errors
- Check your RLS policies in Supabase
- Make sure you're using the anon key, not service role key in frontend

### Variables not updating
```bash
# Stop the dev server and restart
Ctrl+C
npm run dev
```

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Old `.env` file has been deleted or is ignored
- [ ] `.env.example` has no real credentials
- [ ] Service role key is NOT in frontend code
- [ ] RLS policies are enabled on all tables
- [ ] Only `VITE_*` prefixed variables are used in browser code

## Questions?

- Supabase Security: https://supabase.com/docs/guides/auth/row-level-security
- Vite Env Variables: https://vitejs.dev/guide/env-and-mode.html
