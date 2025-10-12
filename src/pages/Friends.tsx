import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Search,
  UserPlus,
  Users,
  Check,
  X,
  User as UserIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  level: number;
  total_xp: number;
  bio: string | null;
}

interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
}

interface FriendWithProfile extends Friendship {
  friend_profile: Profile;
}

const Friends = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendWithProfile[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
  }, []);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchPendingRequests();
      fetchSentRequests();
    }
  }, [user]);

  const fetchFriends = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("friendships")
        .select(`
          *,
          friend_profile:profiles!friendships_friend_id_fkey(*)
        `)
        .eq("user_id", user.id)
        .eq("status", "accepted");

      if (error) throw error;
      setFriends((data || []) as unknown as FriendWithProfile[]);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("friendships")
        .select(`
          *,
          friend_profile:profiles!friendships_user_id_fkey(*)
        `)
        .eq("friend_id", user.id)
        .eq("status", "pending");

      if (error) throw error;
      setPendingRequests((data || []) as unknown as FriendWithProfile[]);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const fetchSentRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("friendships")
        .select(`
          *,
          friend_profile:profiles!friendships_friend_id_fkey(*)
        `)
        .eq("user_id", user.id)
        .eq("status", "pending");

      if (error) throw error;
      setSentRequests((data || []) as unknown as FriendWithProfile[]);
    } catch (error) {
      console.error("Error fetching sent requests:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${searchQuery}%`)
        .neq("id", user.id)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        title: "Search Failed",
        description: "Could not search for users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("friendships").insert({
        user_id: user.id,
        friend_id: friendId,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Friend Request Sent",
        description: "Your friend request has been sent successfully.",
      });

      // Refresh sent requests
      fetchSentRequests();
      // Remove from search results
      setSearchResults(searchResults.filter((p) => p.id !== friendId));
    } catch (error: any) {
      console.error("Error sending friend request:", error);
      toast({
        title: "Failed to Send Request",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const acceptFriendRequest = async (friendshipId: string, friendId: string) => {
    if (!user) return;

    try {
      // Update the existing friendship to accepted
      const { error: updateError } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", friendshipId);

      if (updateError) throw updateError;

      // Create reverse friendship
      const { error: insertError } = await supabase.from("friendships").insert({
        user_id: user.id,
        friend_id: friendId,
        status: "accepted",
      });

      if (insertError) throw insertError;

      toast({
        title: "Friend Request Accepted",
        description: "You are now friends!",
      });

      // Refresh all lists
      fetchFriends();
      fetchPendingRequests();
    } catch (error: any) {
      console.error("Error accepting friend request:", error);
      toast({
        title: "Failed to Accept Request",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const rejectFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "rejected" })
        .eq("id", friendshipId);

      if (error) throw error;

      toast({
        title: "Friend Request Rejected",
        description: "The friend request has been rejected.",
      });

      fetchPendingRequests();
    } catch (error: any) {
      console.error("Error rejecting friend request:", error);
      toast({
        title: "Failed to Reject Request",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeFriend = async (friendshipId: string) => {
    if (!user) return;

    try {
      // Delete both friendship records
      const { error } = await supabase
        .from("friendships")
        .delete()
        .or(`id.eq.${friendshipId},and(user_id.eq.${user.id},friend_id.eq.${friendshipId})`);

      if (error) throw error;

      toast({
        title: "Friend Removed",
        description: "You are no longer friends.",
      });

      fetchFriends();
    } catch (error: any) {
      console.error("Error removing friend:", error);
      toast({
        title: "Failed to Remove Friend",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getFriendshipStatus = (profileId: string): string | null => {
    if (friends.some((f) => f.friend_id === profileId)) return "friends";
    if (sentRequests.some((f) => f.friend_id === profileId)) return "pending";
    if (pendingRequests.some((f) => f.user_id === profileId)) return "incoming";
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Users className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">Friends</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="friends">
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              Requests ({pendingRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search for Friends
                </CardTitle>
                <CardDescription>
                  Find other users by their username
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((profile) => {
                      const status = getFriendshipStatus(profile.id);

                      return (
                        <Card key={profile.id}>
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                {profile.avatar_url ? (
                                  <img
                                    src={profile.avatar_url}
                                    alt={profile.username}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <UserIcon className="w-6 h-6 text-white" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold">{profile.username}</p>
                                <p className="text-sm text-muted-foreground">
                                  Level {profile.level} • {profile.total_xp} XP
                                </p>
                              </div>
                            </div>

                            {status === "friends" ? (
                              <Badge variant="secondary">Friends</Badge>
                            ) : status === "pending" ? (
                              <Badge variant="outline">Request Sent</Badge>
                            ) : status === "incoming" ? (
                              <Badge variant="outline">Incoming Request</Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => sendFriendRequest(profile.id)}
                              >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Friend
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Your Friends
                </CardTitle>
                <CardDescription>
                  {friends.length} {friends.length === 1 ? "friend" : "friends"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {friends.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No friends yet.</p>
                    <p className="text-sm mt-2">Search for users to send friend requests!</p>
                  </div>
                ) : (
                  friends.map((friendship) => {
                    const profile = friendship.friend_profile;

                    return (
                      <Card key={friendship.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                              {profile.avatar_url ? (
                                <img
                                  src={profile.avatar_url}
                                  alt={profile.username}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <UserIcon className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">{profile.username}</p>
                              <p className="text-sm text-muted-foreground">
                                Level {profile.level} • {profile.total_xp} XP
                              </p>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFriend(friendship.id)}
                          >
                            Remove
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>
                  Friend requests waiting for your response
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No pending friend requests.</p>
                  </div>
                ) : (
                  pendingRequests.map((friendship) => {
                    const profile = friendship.friend_profile;

                    return (
                      <Card key={friendship.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                              {profile.avatar_url ? (
                                <img
                                  src={profile.avatar_url}
                                  alt={profile.username}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <UserIcon className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">{profile.username}</p>
                              <p className="text-sm text-muted-foreground">
                                Level {profile.level} • {profile.total_xp} XP
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => acceptFriendRequest(friendship.id, friendship.user_id)}
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => rejectFriendRequest(friendship.id)}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {sentRequests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sent Requests</CardTitle>
                  <CardDescription>
                    Friend requests you've sent
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sentRequests.map((friendship) => {
                    const profile = friendship.friend_profile;

                    return (
                      <Card key={friendship.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                              {profile.avatar_url ? (
                                <img
                                  src={profile.avatar_url}
                                  alt={profile.username}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <UserIcon className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">{profile.username}</p>
                              <p className="text-sm text-muted-foreground">
                                Level {profile.level} • {profile.total_xp} XP
                              </p>
                            </div>
                          </div>

                          <Badge variant="outline">Pending</Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Friends;
