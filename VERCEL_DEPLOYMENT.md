# Vercel Deployment Guide for Tomagotree

## The Problem: SPA Routing 404s

**Symptom**: Routes like `/auth`, `/dashboard`, `/map` work locally but return 404 on Vercel.

**Why?**:
- Your app is a Single Page Application (SPA) using React Router
- Routes are handled **client-side** by JavaScript
- Vercel serves static files and doesn't know about your client-side routes
- When someone visits `/auth` directly, Vercel looks for a file called `/auth` → 404

**Solution**: Use `vercel.json` to rewrite all paths to `index.html`, letting React Router handle routing.

## ✅ Fixed: vercel.json Configuration

The `vercel.json` file at the root of your project handles this:

```json
{
  "cleanUrls": true,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/assets/(.*)", "destination": "/assets/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**What this does**:
1. Any path (`/auth`, `/dashboard`, `/map/123`) → serves `index.html`
2. React Router loads and renders the correct component
3. API routes and assets bypass the rewrite (in case you add them later)

## Vercel Project Settings

### 1. Framework Preset
- **Setting**: `Vite` ✅
- **Location**: Project Settings → General → Framework Preset

### 2. Build Command
- **Setting**: `npm run build` or `vite build`
- **Location**: Project Settings → Build & Output Settings
- **Note**: Should auto-detect from `package.json`

### 3. Output Directory
- **Setting**: `dist` ✅
- **Location**: Project Settings → Build & Output Settings
- **Note**: Vite outputs to `dist/` by default

### 4. Install Command
- **Setting**: `npm install` (default)
- **Auto-detects**: npm, yarn, pnpm, or bun

### 5. Node.js Version
- **Setting**: 18.x or 20.x (recommended)
- **Location**: Project Settings → General → Node.js Version

## Environment Variables in Vercel

You need to add your environment variables in Vercel's dashboard:

### Required Variables

Go to: **Project Settings → Environment Variables**

Add these (copy from your `.env.local`):

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://qmzjkukneotbesnkwiil.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGc...` (your anon key) | Production, Preview, Development |
| `VITE_APP_NAME` | `Tomagotree` | Production, Preview, Development |
| `VITE_DEFAULT_LATITUDE` | `35.9940` | Production, Preview, Development |
| `VITE_DEFAULT_LONGITUDE` | `-78.8986` | Production, Preview, Development |

### Optional Variables (add when features are ready)

| Variable Name | Example Value | When to Add |
|---------------|---------------|-------------|
| `VITE_ENABLE_PHOTO_UPLOAD` | `true` | When photo upload is implemented |
| `VITE_ENABLE_NEIGHBORHOODS` | `true` | When neighborhoods feature is ready |
| `VITE_ENABLE_HEAT_MAP` | `true` | When heat map data is integrated |
| `VITE_MAPBOX_ACCESS_TOKEN` | `pk.eyJ1...` | If using Mapbox instead of OpenStreetMap |

**Important**: All `VITE_*` variables are exposed to the browser. Never put sensitive keys here!

## Supabase Authentication Callback URLs

This is **critical** for auth to work on Vercel.

### 1. Go to Supabase Dashboard
- Navigate to: [Supabase Dashboard](https://supabase.com/dashboard)
- Select your project
- Go to: **Authentication → URL Configuration**

### 2. Site URL
Set this to your production domain:
```
https://tomagotree.vercel.app
```
or your custom domain:
```
https://tomagotree.com
```

### 3. Redirect URLs (Add all of these)
```
http://localhost:8080
http://localhost:8080/auth
http://localhost:8081
http://localhost:8081/auth
https://tomagotree.vercel.app
https://tomagotree.vercel.app/auth
https://tomagotree.vercel.app/dashboard
```

If you have a custom domain, add:
```
https://tomagotree.com
https://tomagotree.com/auth
https://tomagotree.com/dashboard
```

### 4. Why Multiple URLs?
- `localhost:8080` - Your dev server (default port)
- `localhost:8081` - Fallback if port 8080 is in use
- `*.vercel.app` - Your Vercel deployment
- Custom domain - If you set one up

Supabase will redirect users back to these URLs after authentication.

## Deployment Checklist

Before deploying, ensure:

- [ ] `vercel.json` exists at project root
- [ ] `.env.local` is NOT committed (git-ignored)
- [ ] `.env.example` IS committed (for documentation)
- [ ] All required env variables added to Vercel dashboard
- [ ] Supabase redirect URLs include your Vercel domain
- [ ] Build command is `npm run build` or `vite build`
- [ ] Output directory is `dist`
- [ ] Framework preset is `Vite`

## Deploying to Vercel

### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git add vercel.json .env.example .gitignore
   git commit -m "Add Vercel configuration and fix SPA routing"
   git push
   ```

2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel auto-detects Vite settings
   - Add environment variables (see above)
   - Deploy!

3. **Auto-deploy on push**
   - Every push to `main` → production deploy
   - Every PR → preview deploy

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Testing the Deployment

After deploying, test these scenarios:

1. **Direct URL Access**
   - Visit: `https://your-app.vercel.app/auth`
   - Should load auth page (not 404)

2. **Sign Up Flow**
   - Create a new account
   - Check email for verification
   - Should redirect to `/dashboard` after verification

3. **Sign In Flow**
   - Sign in with existing account
   - Should redirect to `/dashboard`

4. **Protected Routes**
   - Visit `/dashboard` when logged out
   - Should redirect to `/auth`

5. **Browser Back/Forward**
   - Navigate between pages
   - Use browser back/forward buttons
   - Routes should work correctly

## Common Issues & Solutions

### Issue: "404 Not Found" on `/auth` route
**Solution**: Make sure `vercel.json` is at the project root and deployed.

```bash
# Check if vercel.json is in your repo
git ls-files | grep vercel.json

# If missing, add it
git add vercel.json
git commit -m "Add vercel.json for SPA routing"
git push
```

### Issue: "Invalid redirect URL" from Supabase
**Solution**: Add your Vercel domain to Supabase redirect URLs.

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add `https://your-app.vercel.app` and `https://your-app.vercel.app/auth`
3. Save and try again

### Issue: Environment variables not working
**Solution**:
1. Verify variables are added in Vercel dashboard
2. Make sure they have `VITE_` prefix (not `NEXT_PUBLIC_`)
3. Redeploy (env variables only apply on build)

```bash
# Force redeploy from CLI
vercel --prod --force
```

### Issue: Blank page on deployment
**Solution**: Check build logs in Vercel dashboard.

Common causes:
- TypeScript errors (strict mode)
- Missing dependencies
- Build command incorrect

### Issue: Auth works locally but not on Vercel
**Solution**:
1. Check Supabase redirect URLs include Vercel domain
2. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel env vars
3. Check browser console for CORS errors

## Custom Domain Setup (Optional)

### 1. Add Domain in Vercel
- Go to: Project Settings → Domains
- Add your domain: `tomagotree.com`
- Follow DNS configuration instructions

### 2. Update Supabase Redirect URLs
Add your custom domain:
```
https://tomagotree.com
https://tomagotree.com/auth
https://tomagotree.com/dashboard
```

### 3. Update Environment Variables (if domain-specific)
If you have domain-specific configs, update in Vercel dashboard.

## Preview Deployments

Every pull request gets a preview deployment:
- URL: `https://tomagotree-git-branch-name-yourname.vercel.app`
- Add preview URLs to Supabase if testing auth on PRs

## Monitoring & Analytics

Vercel provides built-in analytics:
- **Speed Insights**: Page load performance
- **Web Vitals**: Core Web Vitals metrics
- **Real-time logs**: See function logs and errors

Enable in: Project Settings → Analytics

## Build Performance Tips

### 1. Optimize Dependencies
```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer
```

### 2. Enable Caching
Already configured in `vercel.json`:
```json
"headers": [
  {
    "source": "/assets/(.*)",
    "headers": [
      { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
    ]
  }
]
```

### 3. Add Loading States
Improve perceived performance with skeleton loaders (already partially implemented).

## Security Headers (Optional Enhancement)

Add to `vercel.json` for better security:

```json
"headers": [
  {
    "source": "/(.*)",
    "headers": [
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
    ]
  }
]
```

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vite Deployment**: https://vitejs.dev/guide/static-deploy.html
- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **React Router**: https://reactrouter.com/en/main

## Quick Reference

| Item | Value |
|------|-------|
| **Framework** | Vite |
| **Build Command** | `vite build` |
| **Output Directory** | `dist` |
| **Environment Prefix** | `VITE_*` |
| **Routing File** | `vercel.json` |
| **Node Version** | 18.x or 20.x |

---

**Questions or issues?** Check the [Vercel Community](https://github.com/vercel/vercel/discussions) or [Supabase Discord](https://discord.supabase.com/).
