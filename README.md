# Tamagotree

> Fight climate change one tree at a time - A gamified community-driven tree care platform for Durham, NC

**Prevents new-tree death in urban heat islands** with citizen-scheduled watering.

## Inspiration

Urban heat islands are killing newly planted trees in cities across America. While living in Durham, NC, we saw communities plant trees with good intentions, but without ongoing care, many died within their first year. We were inspired to create a solution that combines technology, gamification, and community action to solve this problem. By making tree care fun and rewarding, we can mobilize citizens to become active participants in the fight against climate change, one tree at a time.

## What it does

Tamagotree is a gamified tree care platform that turns urban tree maintenance into an engaging community experience. Users discover and adopt real trees in their neighborhood, complete daily quests with photo verification, earn rewards, customize trees with decorations, connect with friends for collaborative care, and track progress through achievements and leaderboards. See the [Features](#-features) section for complete details.

## How we built it

We built Tamagotree using a modern full-stack approach with React/TypeScript and Supabase. See the [Tech Stack](#-tech-stack) section for complete details.

**Key Technical Decisions:**
- Percentage-based decoration positioning for responsive layouts
- Debounced auto-save (200ms) to reduce database calls
- Dynamic age calculation from timestamps instead of stored values
- Quest system with 18-hour reset cycles to encourage daily engagement

## Challenges we ran into

1. **Decoration Position Persistence** - One challenge was getting decoration positions to save reliably. Initially, decorations would reset to (0,0) on page reload. After multiple debugging attempts, we discovered the root cause: missing UPDATE policies in Row Level Security. This taught us the importance of thorough RLS policy coverage.

2. **Age Calculation Architecture** - We initially tried storing tree age as a static database column, but keeping it updated proved complex. We pivoted to dynamic calculation from the `created_at` timestamp, which eliminated the need for cron jobs or triggers.

3. **Quest Timing Logic** - Designing a quest system that resets every 18 hours (not daily) required careful timestamp comparison logic to ensure quests became available at the right time without creating duplicate entries.

4. **Image Processing Pipeline** - Extracting 8x8 pixel sprites from a single image and upscaling them without blur required learning Sharp's image processing capabilities and configuring the nearest-neighbor algorithm.

5. **Friend Request System** - Preventing duplicate friend requests while handling race conditions required careful database constraints and unique indexes.

6. **Mobile Touch Events** - Making drag-and-drop decorations work on both desktop and mobile required implementing separate mouse and touch event handlers with consistent behavior.

## Accomplishments that we're proud of
- **Complete Feature Set** - Delivered a fully functional app with 9 major feature categories in record time
- **Pixel-Perfect Decorations** - Successfully implemented drag-and-drop decoration system with auto-save and responsive positioning
- **Friend Collaboration** - Built a complete social system including profiles, friend requests, and collaborative quests
- **Polished UI/UX** - Crafted an intuitive, visually appealing interface with smooth animations and responsive design
- **Performance Optimizations** - Implemented debouncing, lazy loading, and optimistic updates for snappy user experience

## What we learned

**Technical Skills:**
- How to implement Row Level Security policies correctly for all CRUD operations
- The power of percentage-based positioning for responsive drag-and-drop interfaces
- Best practices for debounced auto-save to balance UX and performance
- How to structure complex database schemas with proper foreign keys and constraints
- Image processing techniques for pixel art and sprite extraction

## What's next for Tamagotree

**Short-term (Next Sprint):**
- **Weather Integration** - Display real-time VPD and temperature data on tree pages
- **Port to IOS & Android & Push Notifications** - Remind users when their trees need watering and allow them to easily get up and go water them by simply opening an app. 
- **Tree & Tree Species Recognition** - We are on the verge of being able to implement open source API calls to models that recognize weather the image a user uploads is a tree or not, and further to recognize what species of tree it is and infer useful insights about it based on that: https://universe.roboflow.com/tree-species-identification/tree-species-identification-rjtsb/model/1 

**Medium-term (Next Quarter):**
- **Expand to More Cities** - Scale beyond Durham to other NC cities
- **Tree Species Education** - Detailed info about different tree types
- **Quest Variety** - Add more quest types (fertilizing, mulching, pruning)

**Long-term (Future Vision):**
- **National Expansion** - Partner with cities across the US
- **Municipal Dashboard** - Give city officials visibility into tree health
- **IoT Integration** - Soil moisture sensors for automated watering alerts
- **Tree Planting Events** - Organize community planting days
- **Sponsor System** - Let businesses sponsor trees and support urban forestry
- **Educational Partnerships** - Work with schools to teach environmental stewardship
- **Impact Metrics** - Calculate and display carbon offset, air quality improvements

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Credits & Attribution](#-credits--attribution)

---

## Features

### Core Features

#### **Interactive Map & Tree Discovery**
- **Real-time Tree Mapping** - View all trees in Durham on an interactive Leaflet map
- **Geolocation Integration** - Auto-center map on user's current location

#### **Tree Adoption System**
- **Community Trees** - View trees reported by the community
- **One-Click Adoption** - Adopt unadopted trees with a prominent adopt button
- **Personal Tree Care** - Only adopted trees can be decorated and earn rewards
- **Multi-Tree Management** - Users can adopt and care for multiple trees

#### **Tree Decorations Shop**
- **Pixel Art Decorations** - 5 unique decorations (Whale, Scissors, Globe, Bow, Sun)
- **Acorn Currency** - Purchase decorations using earned acorns
- **Ownership Tracking** - Keep inventory of purchased decorations
- **Drag-and-Drop Placement** - Position decorations anywhere on tree photos

#### **Tree Photo Management**
- **Photo Upload** - Capture and upload tree photos
- **Photo Storage** - Secure storage via Supabase Storage
- **Decoration Overlay** - Decorations appear on tree photos

#### **Daily Quest System**
- **Daily Care Tasks** - 3 daily quests:
  - Morning Dew - Water your tree
  - Petal Performer - Sing to your sapling
  - Leaf Collector - Clean up falling branches/leaves
- **18-Hour Reset** - New quests every 18 hours after completion
- **Photo Verification** - Upload photos to prove task completion
- **Reward System** - Earn Acorns, XP, and BP for completing quests
- **Friend Tasks** - Request friends to help with your tree care

#### **Social Features**
- **Friend System** - Add friends and build your network
- **Friend Requests** - Send, accept, or reject friend requests
- **Friend Profiles** - View friends' profiles, trees, and achievements
- **User Search** - Find other users by username
- **Friend List** - See all your friends with their levels and stats
- **Profile Viewing** - Click any friend to see their full profile

#### **Progression & Rewards**
- **XP System** - Earn experience points from activities
- **Level System** - Level up your account and trees independently
- **BP (Branch Points)** - Tree-specific experience for growth
- **Acorn Currency** - Earn acorns to buy decorations and items
- **Achievement System** - Unlock 30+ achievements including:
  - Life Bringer - Plant your first tree
  - Arborist - Plant 5 trees
  - Grove Guardian - Maintain a tree for 50 days
  - Social Butterfly - Add friends
  - Master Gardener - Complete daily tasks
- **Guardian Ranks** - Progress through ranks as you level up
- **Health Tracking** - Monitor tree health percentage (0-100%)

#### **Dashboard & Profile**
- **Personal Dashboard** - Central hub with map view and quick actions
- **Profile Page** - Comprehensive user statistics:
  - Total XP and Level
  - Trees planted count
  - Achievements earned
  - Acorn balance
  - Bio and avatar customization
- **Tree Gallery** - View all your trees with stats
- **Leaderboards** - Compete with other users:
  - Top Acorn Earners
  - Highest XP
  - Most Tree BP
- **Settings** - Customize notifications and preferences

#### **Community Features**
- **Tree Health Reporting** - Report issues with trees
- **Collaborative Care** - Friends can help with tree care tasks
- **Neighborhood View** - See trees in your area

### Technical Features

#### **Authentication & Security**
- **Email/Password Auth** - Secure authentication via Supabase Auth
- **Password Reset** - Email-based password recovery
- **Secure Storage** - Protected file uploads with access policies

---

## Tech Stack

### Frontend Framework & Build Tools
- **[React 18](https://react.dev/)** - Modern UI library with hooks
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Next-generation frontend tooling
- **[React Router v6](https://reactrouter.com/)** - Client-side routing

### UI & Styling
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality React components
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible components
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[React Hot Toast](https://react-hot-toast.com/)** - Toast notifications

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service platform
  - **PostgreSQL Database** - Relational database with RLS
  - **Authentication** - User auth and session management
  - **Storage** - File storage for tree photos
  - **Real-time subscriptions** - Live data updates
  - **Edge Functions** - Serverless functions

### State Management
- **[TanStack Query (React Query)](https://tanstack.com/query)** - Server state management
- **React Hooks** - Local state with useState, useEffect

### Maps & Geolocation
- **[Leaflet](https://leafletjs.com/)** - Interactive map library
- **[React Leaflet](https://react-leaflet.js.org/)** - React components for Leaflet
- **[OpenStreetMap](https://www.openstreetmap.org/)** - Map tile provider
- **Browser Geolocation API** - User location detection

### Image Processing
- **[Sharp](https://sharp.pixelplumbing.com/)** - Node.js image processing
- **Canvas API** - Browser-based image manipulation

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Git](https://git-scm.com/)** - Version control

### Deployment & Hosting
- **[Vercel](https://vercel.com/)** - Frontend hosting and deployment
  - Automatic deployments from Git
  - Preview deployments for PRs
  - Edge network CDN
  - Environment variables management

### MCP Servers Used
- **[Supabase MCP Server](https://github.com/supabase/mcp-server-supabase)** - Direct Supabase integration
  - Database queries
  - Schema management
  - Migration execution
  - Storage operations
  - Log viewing
  - Branch management
- **[Vercel MCP Server](https://github.com/vercel/mcp-server-vercel)** - Vercel integration
  - Deployment management
  - Build logs
  - Project information
  - Domain configuration

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** or **yarn** - Package manager
- **Supabase Account** - [Sign up free](https://supabase.com)
- **Git** - Version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/LevMarushevskyi/Tomagotree.git
   cd Tomagotree
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   See **[ENV_SETUP.md](ENV_SETUP.md)** for detailed configuration.

4. **Run database migrations**
   ```bash
   # Migrations are automatically applied via Supabase MCP
   # Or manually via Supabase Dashboard > SQL Editor
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

---

## Deployment

### Deploy to Vercel (Recommended)

See the **[Vercel Deployment Guide](VERCEL_DEPLOYMENT.md)** for complete instructions.

**Quick Steps:**

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure project settings

3. **Add Environment Variables**
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`

4. **Update Supabase Redirect URLs**
   - Add your Vercel URL to Supabase Auth settings
   - Update allowed URLs in Supabase dashboard

5. **Deploy!**
   - Vercel will automatically deploy on push to main


---

## Credits & Attribution

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Git](https://git-scm.com/)** & **[GitHub](https://github.com/)** - Version control and code hosting

### Core Technologies
- **[React](https://react.dev/)** by Meta, **[TypeScript](https://www.typescriptlang.org/)** by Microsoft, **[Vite](https://vitejs.dev/)** by Evan You & VoidZero
- **[Supabase](https://supabase.com/)** - PostgreSQL database with Row Level Security, authentication, and storage
- **[Vercel](https://vercel.com/)** - Frontend hosting and deployment
- **[Tailwind CSS](https://tailwindcss.com/)**, **[shadcn/ui](https://ui.shadcn.com/)**, **[Radix UI](https://www.radix-ui.com/)**
- **[Leaflet](https://leafletjs.com/)**, **[React Leaflet](https://react-leaflet.js.org/)**, **[OpenStreetMap](https://www.openstreetmap.org/)**
- **[TanStack Query](https://tanstack.com/query)**, **[React Router](https://reactrouter.com/)**, **[Lucide Icons](https://lucide.dev/)**
- **[Sharp](https://sharp.pixelplumbing.com/)** by Lovell Fuller - High-performance image processing

### MCP (Model Context Protocol) Servers
- **[Supabase MCP Server](https://github.com/supabase/mcp-server-supabase)** & **[Vercel MCP Server](https://github.com/vercel/mcp-server-vercel)**

---

## 📄 Documentation

- **[Environment Variables Setup](ENV_SETUP.md)** - Configure `.env.local` for development
- **[Vercel Deployment Guide](VERCEL_DEPLOYMENT.md)** - Complete deployment instructions
- **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Step-by-step pre-flight checklist

---

## Contact

For questions, suggestions, or feedback, please open an issue on GitHub.

---

<div align="center">

[![Supabase](https://img.shields.io/badge/Powered%20by-Supabase-3ECF8E?style=for-the-badge)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge)](https://vercel.com)

</div>
