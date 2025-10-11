# 🚀 Tomagotree Deployment Checklist

Use this checklist before deploying to ensure everything is configured correctly.

## Pre-Deployment

### 1. Files & Configuration
- [x] `vercel.json` exists at project root
- [x] `vercel.json` has SPA rewrite rules
- [x] `.env.local` is git-ignored (not committed)
- [x] `.env.example` is committed (template for team)
- [x] `.gitignore` properly configured
- [ ] All code changes committed and pushed to GitHub

### 2. Build Test
- [x] `npm run build` completes successfully (tested)
- [ ] `npm run preview` works locally (optional test)
- [ ] No TypeScript errors
- [ ] No ESLint errors

Run:
```bash
npm run build
npm run preview  # Test the production build locally
```

### 3. Environment Variables Review
- [x] Using `VITE_*` prefix (not `NEXT_PUBLIC_`)
- [x] Public keys only in `.env.local` (no service role keys)
- [ ] Ready to add to Vercel dashboard

## Vercel Setup

### 4. Project Settings
Go to: **Project Settings** in Vercel

- [ ] Framework Preset: `Vite`
- [ ] Build Command: `vite build` (or `npm run build`)
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install` (auto-detected)
- [ ] Node.js Version: 18.x or 20.x

### 5. Environment Variables
Go to: **Project Settings → Environment Variables**

Add these variables:

- [ ] `VITE_SUPABASE_URL` = `https://qmzjkukneotbesnkwiil.supabase.co`
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` = `eyJhbGc...` (copy from `.env.local`)
- [ ] `VITE_APP_NAME` = `Tomagotree`
- [ ] `VITE_DEFAULT_LATITUDE` = `35.9940`
- [ ] `VITE_DEFAULT_LONGITUDE` = `-78.8986`

Apply to: **Production**, **Preview**, and **Development**

## Supabase Configuration

### 6. Authentication URLs
Go to: [Supabase Dashboard → Authentication → URL Configuration](https://supabase.com/dashboard/project/qmzjkukneotbesnkwiil/auth/url-configuration)

**Site URL**:
- [ ] Set to your production domain (e.g., `https://tomagotree.vercel.app`)

**Redirect URLs** (Add all):
- [ ] `http://localhost:8080`
- [ ] `http://localhost:8080/auth`
- [ ] `http://localhost:8081`
- [ ] `http://localhost:8081/auth`
- [ ] `https://tomagotree.vercel.app` (replace with your actual domain)
- [ ] `https://tomagotree.vercel.app/auth`
- [ ] `https://tomagotree.vercel.app/dashboard`
- [ ] `https://*.vercel.app` (wildcard for preview deployments)

If using custom domain:
- [ ] `https://tomagotree.com`
- [ ] `https://tomagotree.com/auth`
- [ ] `https://tomagotree.com/dashboard`

### 7. Database Security
- [x] Row Level Security (RLS) enabled on all tables
- [x] Proper RLS policies in place (from migration)
- [ ] Test that users can only access their own data

## Deployment

### 8. Initial Deploy
- [ ] Connect GitHub repo to Vercel
- [ ] Trigger first deployment
- [ ] Wait for build to complete
- [ ] Note the deployment URL

### 9. Post-Deploy Testing

Test these on your live Vercel URL:

#### Basic Navigation
- [ ] Homepage loads (`/`)
- [ ] Auth page loads (`/auth`)
- [ ] Dashboard loads (`/dashboard`)
- [ ] Map page loads (`/map`)
- [ ] Profile page loads (`/profile`)
- [ ] 404 page works for invalid routes

#### Authentication Flow
- [ ] Sign up with new email
- [ ] Receive verification email
- [ ] Click verification link (should work)
- [ ] Sign in with credentials
- [ ] Redirect to dashboard after sign in
- [ ] Protected routes redirect to `/auth` when logged out
- [ ] Sign out works

#### Core Features
- [ ] Dashboard displays user info correctly
- [ ] Can report a new tree from Map page
- [ ] Tree appears on dashboard after reporting
- [ ] Profile page shows correct stats
- [ ] Geolocation button works (if allowed)
- [ ] No console errors in browser DevTools

#### Performance
- [ ] Pages load in < 3 seconds
- [ ] No infinite loading states
- [ ] Images/icons load correctly
- [ ] Mobile responsive (test on phone)

### 10. Browser Testing
Test on multiple browsers:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (desktop)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Post-Deployment

### 11. Monitoring
- [ ] Check Vercel Analytics (if enabled)
- [ ] Monitor build times
- [ ] Watch for errors in Vercel logs
- [ ] Check Supabase usage/logs

### 12. Documentation
- [ ] Update README with deployment URL
- [ ] Document any deployment-specific configs
- [ ] Share URL with team/stakeholders

### 13. Optional Enhancements
- [ ] Set up custom domain
- [ ] Enable Vercel Analytics
- [ ] Add error monitoring (Sentry)
- [ ] Set up CI/CD checks (tests, linting)
- [ ] Configure preview deployment environments

## Common Issues to Check

If things don't work after deployment:

### Routes return 404
- [ ] Verify `vercel.json` is in repo and deployed
- [ ] Check Vercel build logs for errors
- [ ] Ensure `vercel.json` rewrites are correct

### Auth doesn't work
- [ ] Verify Supabase redirect URLs include Vercel domain
- [ ] Check that env vars are set in Vercel dashboard
- [ ] Look for CORS errors in browser console
- [ ] Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`

### Blank page
- [ ] Check browser console for errors
- [ ] Verify build completed successfully
- [ ] Check Vercel function logs
- [ ] Ensure all env variables are set

### Environment variables not working
- [ ] Verify variables have `VITE_` prefix
- [ ] Redeploy after adding env vars
- [ ] Check that variables are applied to correct environment

## Rollback Plan

If deployment has critical issues:

1. **Instant Rollback**: Vercel Dashboard → Deployments → Select previous deployment → Promote to Production
2. **Revert Git**: `git revert HEAD && git push`
3. **Fix & Redeploy**: Fix issue locally, test, commit, push

## Next Steps After Successful Deployment

- [ ] Share app with beta testers
- [ ] Collect feedback
- [ ] Monitor error rates
- [ ] Plan next feature development
- [ ] Consider implementing:
  - Photo upload
  - Interactive map view
  - Heat map integration
  - Push notifications
  - Neighborhood features

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Deployment URL**: _______________
**Custom Domain** (if applicable): _______________

✨ **Ready to deploy?** Follow the checklist and launch Tomagotree! 🌱
