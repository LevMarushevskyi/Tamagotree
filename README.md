# 🌳 Tomagotree

> Fight climate change one tree at a time - A gamified community-driven tree care platform for Durham, NC

**Prevents new-tree death in urban heat islands** with citizen-scheduled watering based on vapor pressure deficit (VPD) and night cooling forecasts.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)
[![Built with Supabase](https://img.shields.io/badge/Built%20with-Supabase-3ECF8E)](https://supabase.com)
[![Powered by Claude Code](https://img.shields.io/badge/Powered%20by-Claude%20Code-8A2BE2)](https://claude.com/claude-code)

---

## 💡 Inspiration

Urban heat islands are killing newly planted trees in cities across America. While living in Durham, NC, we saw communities plant trees with good intentions, but without ongoing care, many died within their first year. We were inspired to create a solution that combines technology, gamification, and community action to solve this problem. By making tree care fun and rewarding, we can mobilize citizens to become active guardians of their urban forest, fighting climate change one tree at a time.

## 🌳 What it does

Tamagotree is a gamified tree care platform that turns urban tree maintenance into an engaging community experience. Users can:
- **Discover and adopt** real trees in their neighborhood through an interactive map
- **Complete daily quests** (watering, singing, leaf cleanup) with photo verification
- **Earn rewards** (Acorns, XP, Branch Points) for consistent tree care
- **Customize trees** with decorations purchased from the shop
- **Connect with friends** to collaborate on tree care tasks
- **Track progress** through achievements, levels, and leaderboards
- **Combat urban heat** by ensuring consistent care for vulnerable new trees

The app uses real environmental data (vapor pressure deficit, temperature forecasts) to schedule watering when trees need it most, preventing the all-too-common fate of dying from neglect in their critical first year.

## 🛠️ How we built it

We built Tomagotree using a modern full-stack approach with **Claude Code** as our primary development assistant:

**Frontend:**
- React 18 with TypeScript for type-safe component development
- Vite for lightning-fast build times and hot module replacement
- Tailwind CSS + shadcn/ui for beautiful, accessible UI components
- Leaflet + OpenStreetMap for interactive mapping
- React Query for efficient data fetching and caching

**Backend:**
- Supabase as our Backend-as-a-Service platform
- PostgreSQL with Row Level Security for secure data access
- Supabase Auth for user authentication
- Supabase Storage for tree photo uploads
- Real-time subscriptions for live updates

**Development Workflow:**
- Claude Code for AI-assisted development, debugging, and feature implementation
- Supabase MCP Server for direct database operations and migrations
- Vercel MCP Server for deployment management
- Git for version control and collaboration

**Key Technical Decisions:**
- Percentage-based decoration positioning for responsive layouts
- Debounced auto-save (200ms) to reduce database calls
- Dynamic age calculation from timestamps instead of stored values
- Quest system with 18-hour reset cycles to encourage daily engagement

## 🚧 Challenges we ran into

1. **Decoration Position Persistence** - Our biggest challenge was getting decoration positions to save reliably. Initially, decorations would reset to (0,0) on page reload. After multiple debugging attempts, we discovered the root cause: missing UPDATE policies in Row Level Security. This taught us the importance of thorough RLS policy coverage.

2. **Age Calculation Architecture** - We initially tried storing tree age as a static database column, but keeping it updated proved complex. We pivoted to dynamic calculation from the `created_at` timestamp, which eliminated the need for cron jobs or triggers.

3. **Quest Timing Logic** - Designing a quest system that resets every 18 hours (not daily) required careful timestamp comparison logic to ensure quests became available at the right time without creating duplicate entries.

4. **Image Processing Pipeline** - Extracting 8x8 pixel sprites from a single image and upscaling them without blur required learning Sharp's image processing capabilities and configuring the nearest-neighbor algorithm.

5. **Friend Request System** - Preventing duplicate friend requests while handling race conditions required careful database constraints and unique indexes.

6. **Mobile Touch Events** - Making drag-and-drop decorations work on both desktop and mobile required implementing separate mouse and touch event handlers with consistent behavior.

## 🏆 Accomplishments that we're proud of

- **Real Environmental Impact** - Built a system that addresses actual urban forestry challenges using VPD and temperature data
- **Complete Feature Set** - Delivered a fully functional app with 9 major feature categories in record time
- **Pixel-Perfect Decorations** - Successfully implemented drag-and-drop decoration system with auto-save and responsive positioning
- **Robust Database Design** - Created 15+ tables with proper relationships, constraints, and RLS policies
- **30+ Achievements** - Designed a comprehensive achievement system that rewards various user behaviors
- **Friend Collaboration** - Built a complete social system including profiles, friend requests, and collaborative quests
- **Polished UI/UX** - Crafted an intuitive, visually appealing interface with smooth animations and responsive design
- **Performance Optimizations** - Implemented debouncing, lazy loading, and optimistic updates for snappy user experience
- **Comprehensive Documentation** - Created detailed README, deployment guides, and schema documentation
- **Zero Major Bugs** - Through careful testing and AI-assisted debugging, we achieved a stable release

## 📚 What we learned

**Technical Skills:**
- How to implement Row Level Security policies correctly for all CRUD operations
- The power of percentage-based positioning for responsive drag-and-drop interfaces
- Best practices for debounced auto-save to balance UX and performance
- How to structure complex database schemas with proper foreign keys and constraints
- The importance of optimistic UI updates for perceived performance
- Image processing techniques for pixel art and sprite extraction

**Development Process:**
- Claude Code can dramatically accelerate development when given clear requirements
- MCP servers provide powerful integrations for database and deployment operations
- Breaking complex features into small, tracked tasks prevents oversight
- Real-time debugging with database logs is invaluable for RLS issues
- Git commit hygiene matters for collaboration and rollback capabilities

**Product Design:**
- Gamification works best when rewards align with real-world positive outcomes
- Photo verification creates accountability while building community trust
- Social features (friends, leaderboards) drive sustained engagement
- Visual customization (decorations) creates emotional attachment to trees
- Progressive disclosure (quests, achievements) maintains long-term interest

**Community Impact:**
- Technology can bridge the gap between good intentions and sustained action
- Making environmental action fun and social increases participation
- Real-time feedback (XP, acorns, levels) motivates continued engagement
- Local focus (Durham, NC) creates stronger community bonds

## 🚀 What's next for Tamagotree

**Short-term (Next Sprint):**
- 🌡️ **Weather Integration** - Display real-time VPD and temperature data on tree pages
- 📱 **Port to IOS & Android & Push Notifications** - Remind users when their trees need watering and allow them to easily get up and go water them by simply opening an app. 
- 📚 **Tree & Tree Species Recognition** - We are on the verge of being able to implament open source API calls to models that recognize weather the image a user uploads is a tree or not, and further to recognize what speciaies of tree it is and infer useful insights about it based on that: https://universe.roboflow.com/tree-species-identification/tree-species-identification-rjtsb/model/1 

**Medium-term (Next Quarter):**
- 🗺️ **Expand to More Cities** - Scale beyond Durham to other NC cities
- 🌈 **More Decorations** - Add seasonal decorations and rare collectibles
- 🤝 **Tree Teams** - Form groups to care for multiple trees together
- 📚 **Tree Species Education** - Detailed info about different tree types
- 🎯 **Quest Variety** - Add more quest types (fertilizing, mulching, pruning)
- 💬 **In-App Chat** - Let tree caregivers coordinate care schedules

**Long-term (Future Vision):**
- 🌍 **National Expansion** - Partner with cities across the US
- 🏛️ **Municipal Dashboard** - Give city officials visibility into tree health
- 🔬 **IoT Integration** - Soil moisture sensors for automated watering alerts
- 🌱 **Tree Planting Events** - Organize community planting days
- 💰 **Sponsor System** - Let businesses sponsor trees and support urban forestry
- 🎓 **Educational Partnerships** - Work with schools to teach environmental stewardship
- 📈 **Impact Metrics** - Calculate and display carbon offset, air quality improvements

**Technical Improvements:**
- Implement progressive web app (PWA) features for offline support
- Add more comprehensive test coverage (unit, integration, e2e)
- Optimize image loading with WebP format and lazy loading
- Implement Redis caching for frequently accessed data
- Add GraphQL layer for more efficient data fetching

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
