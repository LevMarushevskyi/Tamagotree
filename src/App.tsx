import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Map from "./pages/Map";
import Profile from "./pages/Profile";
import Leaderboards from "./pages/Leaderboards";
import Friends from "./pages/Friends";
import FriendProfile from "./pages/FriendProfile";
import Shop from "./pages/Shop";
import ResetPassword from "./pages/ResetPassword";
import TreeDetail from "./pages/TreeDetail";
import TreeEdit from "./pages/TreeEdit";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<Map />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboards" element={<Leaderboards />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/friend/:userId" element={<FriendProfile />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/tree/:treeId" element={<TreeDetail />} />
          <Route path="/tree/:treeId/edit" element={<TreeEdit />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
