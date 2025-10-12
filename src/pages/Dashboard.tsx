import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, User as UserIcon, LogOut, TreePine, MapPin, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

interface Profile {
  username: string;
  avatar_url: string | null;
  total_xp: number;
  level: number;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url, total_xp, level")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Signed out successfully",
        description: "See you next time, Tree Guardian!",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <TreePine className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Map Container (Placeholder) */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
        {/* Placeholder for map - will be replaced with actual map component */}
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4 p-8 bg-white/80 dark:bg-gray-900/80 rounded-lg shadow-lg backdrop-blur-sm">
            <MapPin className="w-16 h-16 mx-auto text-primary animate-bounce" />
            <h2 className="text-2xl font-bold">Interactive Map</h2>
            <p className="text-muted-foreground max-w-md">
              The interactive map will be displayed here, showing all trees in the Durham area
              that you can adopt and care for.
            </p>
          </div>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          {/* Left: Menu Button */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shadow-md">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <TreePine className="w-5 h-5 text-primary" />
                  Tomagotree
                </SheetTitle>
                <SheetDescription>
                  Grow trees, earn XP, save Durham
                </SheetDescription>
              </SheetHeader>

              <div className="mt-8 space-y-4">
                {/* User Info */}
                {profile && (
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <p className="font-semibold">{profile.username}</p>
                    <p className="text-sm text-muted-foreground">
                      Level {profile.level} • {profile.total_xp} XP
                    </p>
                  </div>
                )}

                {/* Menu Items */}
                <nav className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/dashboard");
                      setMenuOpen(false);
                    }}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Map View
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/map");
                      setMenuOpen(false);
                    }}
                  >
                    <TreePine className="mr-2 h-4 w-4" />
                    Report a Tree
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/profile");
                      setMenuOpen(false);
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Profile & Settings
                  </Button>
                </nav>

                {/* Sign Out */}
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Center: Title */}
          <div className="flex items-center gap-2">
            <TreePine className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Tomagotree</h1>
          </div>

          {/* Right: Profile Picture */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full shadow-md">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile?.username}</p>
                  <p className="text-xs text-muted-foreground">
                    Level {profile?.level} • {profile?.total_xp} XP
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <UserIcon className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Floating Action Button - Report Tree */}
      <div className="absolute bottom-6 right-6 z-10">
        <Button
          size="lg"
          className="rounded-full shadow-lg h-14 w-14 p-0"
          onClick={() => navigate("/map")}
        >
          <TreePine className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
