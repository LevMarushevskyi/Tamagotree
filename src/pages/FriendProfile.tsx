import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TreePine, Star, Trophy, User as UserIcon, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import { calculateLevelProgress } from "@/utils/xpCalculations";
import { calculateTreeAgeDays } from "@/utils/ageCalculations";

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  total_xp: number;
  level: number;
  guardian_rank: string;
  acorns: number;
  created_at: string;
}

interface Tree {
  id: string;
  name: string;
  species: string | null;
  health_status: string;
  health_percentage: number;
  photo_url: string | null;
  xp_earned: number;
  level: number;
  created_at: string;
}

interface Achievement {
  id: string;
  achievement: {
    name: string;
    description: string | null;
    icon: string | null;
  };
}

const FriendProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initPage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }

      setCurrentUser(session.user);

      if (userId) {
        await Promise.all([
          fetchProfile(userId),
          fetchTrees(userId),
          fetchAchievements(userId),
          checkFriendship(session.user.id, userId)
        ]);
      }

      setLoading(false);
    };

    initPage();
  }, [userId, navigate]);

  const fetchProfile = async (friendId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", friendId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    }
  };

  const fetchTrees = async (friendId: string) => {
    try {
      const { data, error } = await supabase
        .from("tree")
        .select("id, name, species, health_status, health_percentage, photo_url, xp_earned, level, created_at")
        .eq("user_id", friendId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTrees(data || []);
    } catch (error) {
      console.error("Error fetching trees:", error);
    }
  };

  const fetchAchievements = async (friendId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_achievements")
        .select(`
          achievement_id,
          unlocked_at,
          achievement:achievements(id, name, description, icon)
        `)
        .eq("user_id", friendId)
        .order("unlocked_at", { ascending: false });

      if (error) throw error;
      const formattedData = (data || []).map(item => ({
        id: item.achievement_id,
        achievement: item.achievement
      }));
      setAchievements(formattedData);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  };

  const checkFriendship = async (currentUserId: string, friendId: string) => {
    try {
      const { data, error } = await supabase
        .from("friendships")
        .select("id")
        .or(`and(user_id.eq.${currentUserId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${currentUserId})`)
        .eq("status", "accepted")
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsFriend(!!data);
    } catch (error) {
      console.error("Error checking friendship:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-primary/5">
        <TreePine className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => navigate(-1)} size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Profile Not Found</h1>
            <p className="text-muted-foreground mt-2">This user doesn't exist.</p>
          </div>
        </main>
      </div>
    );
  }

  const levelProgress = calculateLevelProgress(profile.total_xp);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex-shrink-0">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl font-bold">{profile.username}</h1>
                    {isFriend && (
                      <Badge variant="secondary">Friend</Badge>
                    )}
                  </div>
                  {profile.bio && (
                    <p className="text-muted-foreground">{profile.bio}</p>
                  )}
                  <div className="flex items-center gap-4 flex-wrap">
                    <Badge variant="outline" className="gap-1">
                      <Star className="w-3 h-3" />
                      Level {profile.level}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <TreePine className="w-3 h-3" />
                      {trees.length} {trees.length === 1 ? 'Tree' : 'Trees'}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Award className="w-3 h-3" />
                      {achievements.length} {achievements.length === 1 ? 'Achievement' : 'Achievements'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress to Level {profile.level + 1}</span>
                  <span className="font-medium">{levelProgress.current} / {levelProgress.required} XP</span>
                </div>
                <Progress value={(levelProgress.current / levelProgress.required) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Trees Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="w-5 h-5 text-primary" />
                {profile.username}'s Trees
              </CardTitle>
              <CardDescription>
                {trees.length === 0
                  ? "No trees planted yet"
                  : `${trees.length} ${trees.length === 1 ? 'tree' : 'trees'} planted`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TreePine className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>This user hasn't planted any trees yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trees.map((tree) => (
                    <Card
                      key={tree.id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => navigate(`/tree/${tree.id}`)}
                    >
                      <CardContent className="p-4">
                        {tree.photo_url && (
                          <img
                            src={tree.photo_url}
                            alt={tree.name}
                            className="w-full h-32 object-cover rounded-md mb-3"
                          />
                        )}
                        <h3 className="font-semibold text-lg mb-1">{tree.name}</h3>
                        {tree.species && (
                          <p className="text-sm text-muted-foreground italic mb-2">{tree.species}</p>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Badge variant={tree.health_status === "healthy" ? "default" : "destructive"}>
                              {tree.health_status}
                            </Badge>
                          </span>
                          <span className="text-muted-foreground">
                            {calculateTreeAgeDays(tree.created_at)} days old
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 inline mr-1" />
                          Level {tree.level} • {tree.xp_earned} BP
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Achievements
              </CardTitle>
              <CardDescription>
                {achievements.length} {achievements.length === 1 ? 'achievement' : 'achievements'} unlocked
              </CardDescription>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No achievements unlocked yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted"
                    >
                      <div className="text-3xl">{achievement.achievement.icon || '🏆'}</div>
                      <div className="flex-1">
                        <p className="font-semibold">{achievement.achievement.name}</p>
                        {achievement.achievement.description && (
                          <p className="text-xs text-muted-foreground">
                            {achievement.achievement.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FriendProfile;
