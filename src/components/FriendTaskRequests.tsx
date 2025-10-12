import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Droplets, Leaf, Scissors, Search, Users, Clock, TreePine, CheckCircle2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface FriendTaskRequest {
  id: string;
  requester_id: string;
  helper_id: string;
  tree_id: string;
  task_type: string;
  status: string;
  requester_reward_acorns: number;
  requester_reward_bp: number;
  helper_reward_acorns: number;
  helper_reward_bp: number;
  created_at: string;
  expires_at: string;
  requester_profile: {
    username: string;
    avatar_url: string | null;
  };
  helper_profile: {
    username: string;
    avatar_url: string | null;
  };
  tree: {
    name: string;
    species: string | null;
  };
}

interface FriendTaskRequestsProps {
  currentUser: User;
}

const TASK_ICONS: Record<string, { icon: any; color: string; label: string }> = {
  water: { icon: Droplets, color: "text-blue-500", label: "Water Tree" },
  fertilize: { icon: Leaf, color: "text-green-500", label: "Fertilize" },
  prune: { icon: Scissors, color: "text-orange-500", label: "Prune" },
  inspect: { icon: Search, color: "text-purple-500", label: "Inspect" },
};

export const FriendTaskRequests = ({ currentUser }: FriendTaskRequestsProps) => {
  const [incomingRequests, setIncomingRequests] = useState<FriendTaskRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendTaskRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, [currentUser]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Fetch incoming requests (where user is the helper)
      const { data: incoming, error: incomingError } = await supabase
        .from("friend_task_requests")
        .select(`
          *,
          requester_profile:profiles!friend_task_requests_requester_id_fkey(username, avatar_url),
          tree(name, species)
        `)
        .eq("helper_id", currentUser.id)
        .eq("status", "pending")
        .lt("expires_at", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false });

      if (incomingError) throw incomingError;

      // Fetch sent requests (where user is the requester)
      const { data: sent, error: sentError } = await supabase
        .from("friend_task_requests")
        .select(`
          *,
          helper_profile:profiles!friend_task_requests_helper_id_fkey(username, avatar_url),
          tree(name, species)
        `)
        .eq("requester_id", currentUser.id)
        .in("status", ["pending", "completed"])
        .order("created_at", { ascending: false });

      if (sentError) throw sentError;

      setIncomingRequests((incoming || []) as unknown as FriendTaskRequest[]);
      setSentRequests((sent || []) as unknown as FriendTaskRequest[]);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error Loading Requests",
        description: "Could not load friend task requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (request: FriendTaskRequest) => {
    setCompletingId(request.id);
    try {
      // Update request status
      const { error: updateError } = await supabase
        .from("friend_task_requests")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", request.id);

      if (updateError) throw updateError;

      // Award rewards to helper
      const { error: helperRewardError } = await supabase.rpc("increment_user_rewards", {
        user_id: request.helper_id,
        acorns_to_add: request.helper_reward_acorns,
        bp_to_add: request.helper_reward_bp,
      });

      if (helperRewardError) throw helperRewardError;

      // Award rewards to requester
      const { error: requesterRewardError } = await supabase.rpc("increment_user_rewards", {
        user_id: request.requester_id,
        acorns_to_add: request.requester_reward_acorns,
        bp_to_add: request.requester_reward_bp,
      });

      if (requesterRewardError) throw requesterRewardError;

      // Update tree XP
      const { error: treeXpError } = await supabase.rpc("add_tree_xp", {
        tree_id: request.tree_id,
        xp_to_add: request.requester_reward_bp,
      });

      if (treeXpError) throw treeXpError;

      toast({
        title: "Task Completed!",
        description: `You earned ${request.helper_reward_acorns} acorns and ${request.helper_reward_bp} BP!`,
      });

      await fetchRequests();
    } catch (error: any) {
      console.error("Error completing task:", error);
      toast({
        title: "Failed to Complete Task",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCompletingId(null);
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const RequestCard = ({ request, isIncoming }: { request: FriendTaskRequest; isIncoming: boolean }) => {
    const taskInfo = TASK_ICONS[request.task_type] || TASK_ICONS.water;
    const Icon = taskInfo.icon;
    const profile = isIncoming ? request.requester_profile : request.helper_profile;
    const isExpired = new Date(request.expires_at) < new Date();
    const isCompleted = request.status === "completed";

    return (
      <Card className={isCompleted ? "opacity-60 bg-muted/50" : isExpired ? "opacity-40" : ""}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-5 h-5 ${taskInfo.color}`} />
                <h3 className="font-semibold">{taskInfo.label}</h3>
                {isCompleted && <Badge variant="secondary">Completed</Badge>}
                {isExpired && !isCompleted && <Badge variant="destructive">Expired</Badge>}
              </div>

              <div className="space-y-1 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{isIncoming ? "From" : "To"}: {profile.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TreePine className="w-4 h-4" />
                  <span>Tree: {request.tree.name}</span>
                </div>
                {!isCompleted && !isExpired && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Expires in: {getTimeRemaining(request.expires_at)}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {isIncoming ? (
                  <>
                    <Badge variant="outline" className="gap-1">
                      🌰 {request.helper_reward_acorns} Acorns
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      ⭐ {request.helper_reward_bp} BP
                    </Badge>
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="gap-1">
                      🌰 {request.requester_reward_acorns} Acorns
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      ⭐ {request.requester_reward_bp} BP
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {isIncoming && !isCompleted && !isExpired && (
              <Button
                size="sm"
                onClick={() => completeTask(request)}
                disabled={completingId === request.id}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {completingId === request.id ? "Completing..." : "Complete"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Friend Task Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 animate-pulse" />
            <p>Loading requests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Friend Task Requests
        </CardTitle>
        <CardDescription>Help friends with tree care and earn rewards together</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="incoming">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incoming">
              Incoming ({incomingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Sent ({sentRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="space-y-3 mt-4">
            {incomingRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No incoming task requests</p>
                <p className="text-sm mt-2">Your friends can ask you to help with their trees!</p>
              </div>
            ) : (
              incomingRequests.map((request) => (
                <RequestCard key={request.id} request={request} isIncoming={true} />
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-3 mt-4">
            {sentRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No sent task requests</p>
                <p className="text-sm mt-2">Request help from friends on your tree detail pages!</p>
              </div>
            ) : (
              sentRequests.map((request) => (
                <RequestCard key={request.id} request={request} isIncoming={false} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
