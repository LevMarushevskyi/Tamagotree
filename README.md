# 🌳 Tomagotree

> Fight climate change one tree at a time - A gamified community-driven tree care platform for Durham, NC

**Prevents new-tree death in urban heat islands** with citizen-scheduled watering based on vapor pressure deficit (VPD) and night cooling forecasts.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)
[![Built with Supabase](https://img.shields.io/badge/Built%20with-Supabase-3ECF8E)](https://supabase.com)
[![Powered by Claude Code](https://img.shields.io/badge/Powered%20by-Claude%20Code-8A2BE2)](https://claude.com/claude-code)

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Credits & Attribution](#-credits--attribution)

---

## 🎮 Features

### Core Features

#### 🗺️ **Interactive Map & Tree Discovery**
- **Real-time Tree Mapping** - View all trees in Durham on an interactive Leaflet map
- **Geolocation Integration** - Auto-center map on user's current location
- **Tree Markers** - Color-coded markers showing tree health status
- **Cluster View** - Trees grouped by proximity for better visualization
- **Search & Filter** - Find specific trees or filter by status

#### 🌱 **Tree Adoption System**
- **Community Trees** - View trees reported by the community
- **One-Click Adoption** - Adopt unadopted trees with a prominent adopt button
- **Personal Tree Care** - Only adopted trees can be decorated and earn rewards
- **Multi-Tree Management** - Users can adopt and care for multiple trees
- **Adoption Status Badge** - Clear visual indicators for adopted vs available trees

#### 🎨 **Tree Decorations Shop**
- **Pixel Art Decorations** - 5 unique decorations (Whale, Scissors, Globe, Bow, Sun)
- **Category Shopping** - Organized by decoration type (animals, tools, objects, accessories, nature)
- **Acorn Currency** - Purchase decorations using earned acorns
- **Ownership Tracking** - Keep inventory of purchased decorations
- **Drag-and-Drop Placement** - Position decorations anywhere on tree photos
- **Real-time Auto-Save** - Positions saved continuously with debouncing
- **Mobile-Friendly** - Touch support for mobile devices

#### 📸 **Tree Photo Management**
- **Photo Upload** - Capture and upload tree photos
- **Photo Storage** - Secure storage via Supabase Storage
- **Decoration Overlay** - Decorations appear on tree photos
- **Interactive Photo View** - Drag decorations to reposition
- **Photo History** - Track tree growth over time

#### 🎯 **Daily Quest System**
- **Daily Care Tasks** - 3 rotating daily quests:
  - 💧 Morning Dew - Water your tree
  - 🎵 Petal Performer - Sing to your sapling
  - 🍂 Leaf Collector - Clean up falling branches/leaves
- **18-Hour Reset** - New quests every 18 hours after completion
- **Photo Verification** - Upload photos to prove task completion
- **Reward System** - Earn Acorns, XP, and BP for completing quests
- **Progress Tracking** - Visual indicators for quest completion
- **Friend Tasks** - Request friends to help with your tree care

#### 👥 **Social Features**
- **Friend System** - Add friends and build your network
- **Friend Requests** - Send, accept, or reject friend requests
- **Friend Profiles** - View friends' profiles, trees, and achievements
- **User Search** - Find other users by username
- **Friend List** - See all your friends with their levels and stats
- **Profile Viewing** - Click any friend to see their full profile

#### 🏆 **Progression & Rewards**
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
- **Tree Age Tracking** - Automatically calculated from creation date

#### 📊 **Dashboard & Profile**
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

#### 🌍 **Community Features**
- **Public Tree Reporting** - Anyone can report trees in the community
- **Tree Health Reporting** - Report issues with trees
- **Collaborative Care** - Friends can help with tree care tasks
- **Neighborhood View** - See trees in your area

### Technical Features

#### 🔐 **Authentication & Security**
- **Email/Password Auth** - Secure authentication via Supabase Auth
- **Password Reset** - Email-based password recovery
- **Row Level Security (RLS)** - Database-level security policies
- **Secure Storage** - Protected file uploads with access policies

#### 📱 **Responsive Design**
- **Mobile-First** - Optimized for phones and tablets
- **Desktop Support** - Full-featured desktop experience
- **Touch Gestures** - Drag-and-drop works on touch devices
- **Adaptive Layouts** - Responsive grid systems

#### ⚡ **Performance**
- **Lazy Loading** - Images and components load on demand
- **Optimistic Updates** - UI updates before server confirmation
- **Debounced Saves** - Reduced database calls for position updates
- **Image Optimization** - Compressed and cached images
- **Code Splitting** - Reduced initial bundle size

---

## 🛠️ Tech Stack

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
- **[Claude Code](https://claude.com/claude-code)** - AI-powered development assistant
  - Code generation and refactoring
  - Feature implementation
  - Bug fixing and debugging
  - Documentation writing
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

## 🚀 Getting Started

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

## 📦 Deployment

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

### Alternative: Deploy with Lovable

Simply open [Lovable](https://lovable.dev/projects/49d24c51-7337-45c0-b38d-efef579a9686) and click **Share → Publish**.

---

## 🙏 Credits & Attribution

### Development Tools

#### Claude Code
**[Claude Code by Anthropic](https://claude.com/claude-code)** - The entire Tomagotree application was built with the assistance of Claude Code, an AI-powered development assistant that helped with:
- Feature planning and architecture
- Code generation and implementation
- Bug fixing and debugging
- Performance optimization
- Database schema design
- Documentation writing
- Best practices and patterns

### Backend Infrastructure

#### Supabase
**[Supabase](https://supabase.com/)** - Open-source Firebase alternative providing:
- PostgreSQL database with Row Level Security
- Authentication and user management
- File storage for tree photos
- Real-time subscriptions
- Edge functions for serverless compute
- Database migrations
- Generous free tier

Special thanks to the Supabase team for their excellent documentation and MCP server integration.

### Frontend Technologies

#### React & Ecosystem
- **[React](https://react.dev/)** by Meta - UI library
- **[React Router](https://reactrouter.com/)** by Remix - Routing solution
- **[React Query / TanStack Query](https://tanstack.com/query)** by TanStack - Data fetching

#### UI Components & Design
- **[shadcn/ui](https://ui.shadcn.com/)** by shadcn - Component collection
- **[Radix UI](https://www.radix-ui.com/)** by WorkOS - Primitive components
- **[Tailwind CSS](https://tailwindcss.com/)** by Tailwind Labs - Utility CSS
- **[Lucide Icons](https://lucide.dev/)** - Icon library

#### Build Tools
- **[Vite](https://vitejs.dev/)** by Evan You & VoidZero - Build tool
- **[TypeScript](https://www.typescriptlang.org/)** by Microsoft - Type system
- **[PostCSS](https://postcss.org/)** - CSS transformation

### Maps & Geolocation
- **[Leaflet](https://leafletjs.com/)** by Vladimir Agafonkin - Map library
- **[React Leaflet](https://react-leaflet.js.org/)** - React integration
- **[OpenStreetMap](https://www.openstreetmap.org/)** - Map data and tiles
- **[OpenStreetMap Contributors](https://www.openstreetmap.org/copyright)** - Community map data

### Image Processing
- **[Sharp](https://sharp.pixelplumbing.com/)** by Lovell Fuller - High-performance image processing

### Hosting & Deployment
- **[Vercel](https://vercel.com/)** - Frontend hosting with:
  - Automatic deployments
  - Preview environments
  - Edge network
  - Analytics
  - Vercel MCP Server integration

### MCP (Model Context Protocol) Servers
- **[Supabase MCP Server](https://github.com/supabase/mcp-server-supabase)** - Database operations
- **[Vercel MCP Server](https://github.com/vercel/mcp-server-vercel)** - Deployment management

### Development Tools & Libraries
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Git](https://git-scm.com/)** - Version control
- **[GitHub](https://github.com/)** - Code hosting
- **[npm](https://www.npmjs.com/)** - Package management

### Additional Libraries
- **[@supabase/supabase-js](https://github.com/supabase/supabase-js)** - Supabase client
- **[date-fns](https://date-fns.org/)** - Date utilities
- **[clsx](https://github.com/lukeed/clsx)** - Conditional classes
- **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Tailwind class merging

### Inspiration & Resources
- **Durham, NC Community** - For the mission to combat urban heat islands
- **Open Source Community** - For countless libraries and tools
- **Stack Overflow** - For community knowledge
- **GitHub Discussions** - For technical solutions

---

## 📄 Documentation

- **[Environment Variables Setup](ENV_SETUP.md)** - Configure `.env.local` for development
- **[Vercel Deployment Guide](VERCEL_DEPLOYMENT.md)** - Complete deployment instructions
- **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Step-by-step pre-flight checklist
- **[User Data Schema](USER_DATA_SCHEMA.md)** - Database schema documentation

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Contact

For questions, suggestions, or feedback, please open an issue on GitHub.

---

## 🌟 Acknowledgments

Special thanks to:
- **Anthropic** for creating Claude and Claude Code
- **Supabase team** for an amazing backend platform
- **Vercel team** for seamless deployment
- **Open source community** for the incredible ecosystem
- **Durham community** for inspiring this climate action project

---

<div align="center">

**Built with ❤️ using Claude Code**

[![Claude Code](https://img.shields.io/badge/Built%20with-Claude%20Code-8A2BE2?style=for-the-badge)](https://claude.com/claude-code)
[![Supabase](https://img.shields.io/badge/Powered%20by-Supabase-3ECF8E?style=for-the-badge)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge)](https://vercel.com)

</div>
