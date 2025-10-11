# Fixing 404 Errors on Vercel - Multiple Solutions

Your routes are returning 404 on Vercel. I've created **multiple solutions** - try them in order until one works.

## Current Setup

✅ `_redirects` file added to `public/` (copies to dist/)
✅ Updated `vite.config.ts` with explicit build settings
✅ Multiple `vercel.json` configurations available

## Solution 1: Simple Routes Configuration (RECOMMENDED - TRY THIS FIRST)

The current [vercel.json](vercel.json) uses the simplest approach:

```json
{
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**What it does:**
1. First tries to serve actual files (assets, index.html, etc.)
2. If no file exists, serves index.html

**To deploy:**
```bash
git add vercel.json vite.config.ts public/_redirects
git commit -m "Fix: Add SPA routing with routes config"
git push
```

---

## Solution 2: More Explicit Routes (If Solution 1 doesn't work)

Replace `vercel.json` with the contents of `vercel-alt1.json`:

```bash
cp vercel-alt1.json vercel.json
git add vercel.json
git commit -m "Fix: Use explicit route matching"
git push
```

This version explicitly matches assets, favicon, robots.txt before falling back to index.html.

---

## Solution 3: Ultra-Simple Rewrites (If Solution 2 doesn't work)

Replace `vercel.json` with the contents of `vercel-alt2.json`:

```bash
cp vercel-alt2.json vercel.json
git add vercel.json
git commit -m "Fix: Use simple rewrites to root"
git push
```

This uses the absolute simplest rewrite possible: everything → `/`

---

## Solution 4: Check Vercel Build Settings

Sometimes the issue is in Vercel's dashboard settings, not the config files.

### Go to Vercel Dashboard → Your Project → Settings

#### Build & Development Settings:
- **Framework Preset**: `Vite` (or `Other` if Vite isn't detected)
- **Build Command**: `npm run build` or `vite build`
- **Output Directory**: `dist` (NOT `build`, NOT `out`)
- **Install Command**: `npm install` (default, usually fine)

#### Root Directory:
- Should be `.` (root of repo)
- If you changed this, reset it to `.`

#### Environment Variables:
Make sure these are set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## Solution 5: Force Vercel to Redeploy

Sometimes Vercel caches old configs. Force a clean deploy:

### Option A: Via Dashboard
1. Go to Deployments tab
2. Click the three dots on latest deployment
3. Select "Redeploy"
4. Check "Use existing Build Cache" → **UNCHECK THIS**
5. Click "Redeploy"

### Option B: Via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Force deploy
vercel --force --prod
```

### Option C: Dummy Commit
```bash
# Add a comment to trigger rebuild
echo "# Trigger rebuild" >> README.md
git add README.md
git commit -m "chore: trigger vercel rebuild"
git push
```

---

## Solution 6: Check Build Logs

The issue might be in the build itself.

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the failed deployment
3. Scroll down to **Build Logs**
4. Look for errors:
   - TypeScript errors
   - Missing environment variables
   - Build command failures

Common errors:
```
Error: Cannot find module '@/...'
→ TypeScript path resolution issue

Error: process is not defined
→ Vite config issue

Error: VITE_SUPABASE_URL is undefined
→ Missing environment variables
```

---

## Solution 7: Test Locally with Preview

Before deploying, test the production build locally:

```bash
# Build
npm run build

# Preview (simulates production)
npm run preview
```

Visit the preview URL and test:
- Navigate to `/auth`
- Refresh the page
- Does it still work? ✅ Good! Should work on Vercel.
- Gets 404? ❌ There's a build issue.

---

## Solution 8: Nuclear Option - Check Your React Router Setup

If NOTHING above works, the issue might be in your React Router configuration.

### Check [src/App.tsx](src/App.tsx):

Your current setup:
```tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/map" element={<Map />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

This looks correct. But if it's still failing, try adding `basename`:

```tsx
<BrowserRouter basename="/">
```

Or as a temporary workaround, switch to HashRouter:

```tsx
import { HashRouter } from "react-router-dom";

<HashRouter>
  {/* routes */}
</HashRouter>
```

**Note**: HashRouter gives URLs like `/#/auth` (less pretty), but it works without server config.

---

## Solution 9: Alternative - Deploy to Netlify Instead

If Vercel continues to have issues, Netlify might work better.

The `_redirects` file in `public/` is **specifically for Netlify** and should work automatically:

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

Or connect via GitHub in Netlify dashboard.

**Netlify Settings:**
- Build command: `npm run build`
- Publish directory: `dist`
- No `netlify.toml` needed - `_redirects` file handles it

---

## Debugging Checklist

Check each of these:

### Files Present:
- [ ] `vercel.json` exists in root
- [ ] `public/_redirects` exists
- [ ] `vite.config.ts` has build config

### Vercel Dashboard:
- [ ] Output Directory = `dist`
- [ ] Framework Preset = `Vite` or `Other`
- [ ] Build Command = `npm run build`
- [ ] Environment variables are set

### Local Test:
- [ ] `npm run build` succeeds
- [ ] `npm run preview` works
- [ ] Direct URL access works in preview

### Git:
- [ ] `vercel.json` is committed
- [ ] Changes are pushed to GitHub
- [ ] Vercel is deploying latest commit

### Deployment:
- [ ] Build logs show no errors
- [ ] Deployment status = "Ready"
- [ ] Tried force redeploy without cache

---

## What to Try Next

1. **Try Solution 1** (current vercel.json with routes)
2. If that fails after redeploying, **check Vercel build logs** for errors
3. If build succeeds but still 404s, **try Solution 2** (explicit routes)
4. If still failing, **check Build Settings** in Vercel dashboard
5. If nothing works, **try Netlify** as alternative

---

## Still Not Working?

If you've tried everything above and it's still not working, please provide:

1. **Your Vercel deployment URL** (e.g., `https://tomagotree.vercel.app`)
2. **The exact error** you're seeing (screenshot or console errors)
3. **Build logs from Vercel** (copy/paste the error section)
4. **Which solutions you've tried** (1, 2, 3, etc.)

With that info, I can diagnose the specific issue.

---

## Quick Reference

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel routing config |
| `public/_redirects` | Netlify fallback (also copied to Vercel's dist) |
| `vite.config.ts` | Build output config |
| `vercel-alt1.json` | Alternative explicit config |
| `vercel-alt2.json` | Alternative simple rewrite |

**Current active config**: Solution 1 (simple routes in `vercel.json`)
