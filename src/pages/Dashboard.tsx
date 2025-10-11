import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sprout, Award, TreePine, LogOut, Plus, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  username: string;
  total_xp: number;
  level: number;
}

interface Tree {
  id: string;
  name: string;
  species: string | null;
  age_days: number;
  health_status: string;
  xp_earned: number;
  photo_url: string | null;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTrees();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, total_xp, level")
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

  const fetchTrees = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("trees")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTrees(data || []);
    } catch (error: any) {
      console.error("Error fetching trees:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const xpToNextLevel = profile ? profile.level * 100 : 100;
  const xpProgress = profile ? (profile.total_xp % 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Sprout className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Tomagotree</h1>
          </div>
          <Button variant="outline" onClick={handleSignOut} size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Profile Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-primary" />
                Welcome back, {profile?.username}!
              </CardTitle>
              <CardDescription>Level {profile?.level} Tree Guardian</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span>XP Progress</span>
                  <span className="text-muted-foreground">
                    {xpProgress} / {xpToNextLevel} XP
                  </span>
                </div>
                <Progress value={(xpProgress / xpToNextLevel) * 100} className="h-3" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <Award className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{profile?.total_xp}</div>
                  <div className="text-sm text-muted-foreground">Total XP</div>
                </div>
                <div className="text-center p-4 bg-secondary/10 rounded-lg">
                  <TreePine className="w-6 h-6 mx-auto mb-2 text-secondary" />
                  <div className="text-2xl font-bold">{trees.length}</div>
                  <div className="text-sm text-muted-foreground">Trees Planted</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => navigate("/map")} className="w-full">
                <MapPin className="w-4 h-4 mr-2" />
                Report New Tree
              </Button>
              <Button onClick={() => navigate("/profile")} variant="outline" className="w-full">
                View Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Trees Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Trees</CardTitle>
                <CardDescription>Monitor and care for your saplings</CardDescription>
              </div>
              <Button onClick={() => navigate("/map")} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Tree
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {trees.length === 0 ? (
              <div className="text-center py-12">
                <TreePine className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No trees yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your journey by reporting your first sapling!
                </p>
                <Button onClick={() => navigate("/map")}>
                  <MapPin className="w-4 h-4 mr-2" />
                  Report Your First Tree
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {trees.map((tree) => (
                  <Card key={tree.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      {tree.photo_url ? (
                        <img src={tree.photo_url} alt={tree.name} className="w-full h-full object-cover" />
                      ) : (
                        <TreePine className="w-16 h-16 text-primary/40" />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{tree.name}</h3>
                      {tree.species && (
                        <p className="text-sm text-muted-foreground mb-2">{tree.species}</p>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{tree.age_days} days old</span>
                        <span className="font-medium text-primary">+{tree.xp_earned} XP</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
