# 🌳 Tomagotree

> Fight climate change one tree at a time - A community-driven tree care platform for Durham, NC

**Prevents new-tree death in urban heat islands** with citizen-scheduled watering based on vapor pressure deficit (VPD) and night cooling forecasts.

## Project info

**Lovable URL**: https://lovable.dev/projects/49d24c51-7337-45c0-b38d-efef579a9686

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/49d24c51-7337-45c0-b38d-efef579a9686) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## 📚 Documentation

- **[Environment Variables Setup](ENV_SETUP.md)** - Configure `.env.local` for development
- **[Vercel Deployment Guide](VERCEL_DEPLOYMENT.md)** - Complete deployment instructions
- **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Step-by-step pre-flight checklist

## How can I deploy this project?

### Option 1: Vercel (Recommended)

See the **[Vercel Deployment Guide](VERCEL_DEPLOYMENT.md)** for complete instructions.

Quick steps:
1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Update Supabase redirect URLs
5. Deploy!

### Option 2: Lovable

Simply open [Lovable](https://lovable.dev/projects/49d24c51-7337-45c0-b38d-efef579a9686) and click on Share -> Publish.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

See **[ENV_SETUP.md](ENV_SETUP.md)** for detailed configuration.

## Features

### ✅ Implemented
- User authentication (sign up/sign in)
- Tree/sapling reporting with geolocation
- User dashboard with XP and leveling system
- Profile page with achievements
- Basic tree management

### 🚧 Coming Soon
- Interactive map view with heat zones
- Photo upload for tree tracking
- VPD-based watering notifications
- Neighborhood competition
- Task scheduling system
- Mobile app (PWA/Capacitor)

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **Routing**: React Router v6
- **State**: TanStack Query (React Query)
- **Deployment**: Vercel
