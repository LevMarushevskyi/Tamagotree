import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Coins, Star, Sprout, Medal, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url: string | null;
  value: number;
  rank: number;
}

const Leaderboards = () => {
  const [acornsLeaderboard, setAcornsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [xpLeaderboard, setXpLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [bpLeaderboard, setBpLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUserId(session.user.id);
      }
    });
    fetchLeaderboards();
  }, []);

  const getWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday as start of week
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart.toISOString();
  };

  const fetchLeaderboards = async () => {
    setLoading(true);
    try {
      const weekStart = getWeekStart();

      // Fetch Acorns Leaderboard (top 10)
      const { data: acornsData, error: acornsError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, acorns")
        .order("acorns", { ascending: false })
        .limit(10);

      if (acornsError) throw acornsError;

      const acornsFormatted = acornsData.map((entry, index) => ({
        id: entry.id,
        username: entry.username,
        avatar_url: entry.avatar_url,
        value: entry.acorns,
        rank: index + 1,
      }));
      setAcornsLeaderboard(acornsFormatted);

      // Fetch Total XP Leaderboard (top 10)
      const { data: xpData, error: xpError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, total_xp")
        .order("total_xp", { ascending: false })
        .limit(10);

      if (xpError) throw xpError;

      const xpFormatted = xpData.map((entry, index) => ({
        id: entry.id,
        username: entry.username,
        avatar_url: entry.avatar_url,
        value: entry.total_xp,
        rank: index + 1,
      }));
      setXpLeaderboard(xpFormatted);

      // Fetch Tree Bloom Points Leaderboard (top 10)
      // Sum all BP from trees created this week for each user
      const { data: bpData, error: bpError } = await supabase
        .from("tree")
        .select("user_id, xp_earned, created_at")
        .gte("created_at", weekStart);

      if (bpError) throw bpError;

      // Group by user_id and sum xp_earned
      const userBpMap = new Map<string, number>();
      bpData.forEach((tree) => {
        const currentBp = userBpMap.get(tree.user_id) || 0;
        userBpMap.set(tree.user_id, currentBp + tree.xp_earned);
      });

      // Get user details for BP leaders
      const userIds = Array.from(userBpMap.keys());
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", userIds);

        if (usersError) throw usersError;

        const bpFormatted = usersData
          .map((user) => ({
            id: user.id,
            username: user.username,
            avatar_url: user.avatar_url,
            value: userBpMap.get(user.id) || 0,
            rank: 0, // Will be set after sorting
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10)
          .map((entry, index) => ({
            ...entry,
            rank: index + 1,
          }));

        setBpLeaderboard(bpFormatted);
      } else {
        setBpLeaderboard([]);
      }
    } catch (error) {
      console.error("Error fetching leaderboards:", error);
      toast({
        title: "Error",
        description: "Failed to load leaderboards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-700" />;
      default:
        return <span className="text-2xl font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const renderLeaderboard = (
    data: LeaderboardEntry[],
    icon: React.ReactNode,
    label: string,
    colorClass: string
  ) => {
    if (data.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No data available yet.</p>
          <p className="text-sm mt-2">Be the first to climb the leaderboard!</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {data.map((entry) => {
          const isCurrentUser = entry.id === currentUserId;
          return (
            <Card
              key={entry.id}
              className={`transition-all hover:shadow-md ${
                isCurrentUser ? "border-primary border-2" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {entry.avatar_url ? (
                      <img
                        src={entry.avatar_url}
                        alt={entry.username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg font-bold text-white">
                        {entry.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Username */}
                  <div className="flex-1">
                    <p className="font-semibold text-lg">
                      {entry.username}
                      {isCurrentUser && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          You
                        </Badge>
                      )}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-2">
                    <div className={colorClass}>{icon}</div>
                    <span className="text-2xl font-bold">{entry.value.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">{label}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Trophy className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold">Leaderboards</h1>
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            <p className="text-muted-foreground text-lg">
              Compete with other guardians and climb to the top!
            </p>
          </div>

          {/* Leaderboard Tabs */}
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="acorns" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="acorns" className="flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    Acorns
                  </TabsTrigger>
                  <TabsTrigger value="xp" className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Total XP
                  </TabsTrigger>
                  <TabsTrigger value="bp" className="flex items-center gap-2">
                    <Sprout className="w-4 h-4" />
                    Tree BP (Week)
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="acorns" className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">Top Acorn Collectors</h2>
                    <p className="text-sm text-muted-foreground">
                      Who has collected the most acorns overall?
                    </p>
                  </div>
                  {renderLeaderboard(
                    acornsLeaderboard,
                    <Coins className="w-6 h-6" />,
                    "acorns",
                    "text-amber-600"
                  )}
                </TabsContent>

                <TabsContent value="xp" className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">Top Guardian XP</h2>
                    <p className="text-sm text-muted-foreground">
                      Who has earned the most experience overall?
                    </p>
                  </div>
                  {renderLeaderboard(
                    xpLeaderboard,
                    <Star className="w-6 h-6" />,
                    "XP",
                    "text-accent"
                  )}
                </TabsContent>

                <TabsContent value="bp" className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">Top Tree Bloom Points (This Week)</h2>
                    <p className="text-sm text-muted-foreground">
                      Who has earned the most BP on their trees this week?
                    </p>
                  </div>
                  {renderLeaderboard(
                    bpLeaderboard,
                    <Sprout className="w-6 h-6" />,
                    "BP",
                    "text-green-600"
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Leaderboards;
