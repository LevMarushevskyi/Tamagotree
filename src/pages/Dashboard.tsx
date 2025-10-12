import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User as UserIcon, TreePine, MapPin } from "lucide-react";
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
  const navigate = useNavigate();

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
          {/* Left: Empty space for balance */}
          <div className="w-10"></div>

          {/* Center: Title */}
          <div className="flex items-center gap-2">
            <TreePine className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Tamagotree</h1>
          </div>

          {/* Right: Profile Picture - Click to go to profile */}
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shadow-md"
            onClick={() => navigate("/profile")}
          >
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
