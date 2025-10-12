import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Users, Droplets, Leaf, Scissors, Search } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Friend {
  id: string;
  friend_id: string;
  friend_profile: {
    id: string;
    username: string;
    avatar_url: string | null;
    level: number;
  };
}

interface FriendTaskRequestProps {
  treeId: string;
  treeName: string;
  currentUser: User;
  onRequestSent?: () => void;
}

const TASK_TYPES = [
  { value: "water", label: "Water Tree", icon: Droplets, color: "text-blue-500" },
  { value: "fertilize", label: "Fertilize", icon: Leaf, color: "text-green-500" },
  { value: "prune", label: "Prune", icon: Scissors, color: "text-orange-500" },
  { value: "inspect", label: "Inspect", icon: Search, color: "text-purple-500" },
];

const TASK_REWARDS = {
  water: { requester: { acorns: 20, bp: 30 }, helper: { acorns: 30, bp: 40 } },
  fertilize: { requester: { acorns: 25, bp: 35 }, helper: { acorns: 35, bp: 45 } },
  prune: { requester: { acorns: 30, bp: 40 }, helper: { acorns: 40, bp: 50 } },
  inspect: { requester: { acorns: 15, bp: 25 }, helper: { acorns: 25, bp: 35 } },
};

export const FriendTaskRequest = ({ treeId, treeName, currentUser, onRequestSent }: FriendTaskRequestProps) => {
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchingFriends, setFetchingFriends] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchFriends();
    }
  }, [open]);

  const fetchFriends = async () => {
    setFetchingFriends(true);
    try {
      const { data, error } = await supabase
        .from("friendships")
        .select(`
          id,
          friend_id,
          friend_profile:profiles!friendships_friend_id_fkey(
            id,
            username,
            avatar_url,
            level
          )
        `)
        .eq("user_id", currentUser.id)
        .eq("status", "accepted");

      if (error) throw error;
      setFriends((data || []) as unknown as Friend[]);
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast({
        title: "Error Loading Friends",
        description: "Could not load your friends list.",
        variant: "destructive",
      });
    } finally {
      setFetchingFriends(false);
    }
  };

  const handleSendRequest = async () => {
    if (!selectedFriend || !selectedTask) {
      toast({
        title: "Missing Information",
        description: "Please select both a friend and a task.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const rewards = TASK_REWARDS[selectedTask as keyof typeof TASK_REWARDS];

      const { error } = await supabase.from("friend_task_requests").insert({
        requester_id: currentUser.id,
        helper_id: selectedFriend,
        tree_id: treeId,
        task_type: selectedTask,
        requester_reward_acorns: rewards.requester.acorns,
        requester_reward_bp: rewards.requester.bp,
        helper_reward_acorns: rewards.helper.acorns,
        helper_reward_bp: rewards.helper.bp,
      });

      if (error) throw error;

      toast({
        title: "Request Sent!",
        description: "Your friend has been notified of the task request.",
      });

      setOpen(false);
      setSelectedFriend("");
      setSelectedTask("");
      onRequestSent?.();
    } catch (error: any) {
      console.error("Error sending request:", error);
      toast({
        title: "Failed to Send Request",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedTaskInfo = TASK_TYPES.find(t => t.value === selectedTask);
  const rewards = selectedTask ? TASK_REWARDS[selectedTask as keyof typeof TASK_REWARDS] : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="w-4 h-4 mr-2" />
          Request Friend Help
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Friend Help</DialogTitle>
          <DialogDescription>
            Ask a friend to complete a daily task on {treeName}. You'll both receive rewards!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Friend Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Friend</label>
            <Select value={selectedFriend} onValueChange={setSelectedFriend}>
              <SelectTrigger>
                <SelectValue placeholder={fetchingFriends ? "Loading friends..." : "Choose a friend"} />
              </SelectTrigger>
              <SelectContent>
                {friends.length === 0 && !fetchingFriends && (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                    No friends found. Add some friends first!
                  </div>
                )}
                {friends.map((friend) => (
                  <SelectItem key={friend.friend_id} value={friend.friend_id}>
                    {friend.friend_profile.username} (Level {friend.friend_profile.level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Task Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Task</label>
            <Select value={selectedTask} onValueChange={setSelectedTask}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a task" />
              </SelectTrigger>
              <SelectContent>
                {TASK_TYPES.map((task) => {
                  const Icon = task.icon;
                  return (
                    <SelectItem key={task.value} value={task.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${task.color}`} />
                        {task.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Rewards Preview */}
          {rewards && selectedTaskInfo && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {(() => {
                      const Icon = selectedTaskInfo.icon;
                      return <Icon className={`w-4 h-4 ${selectedTaskInfo.color}`} />;
                    })()}
                    <span>Rewards for {selectedTaskInfo.label}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">You receive:</p>
                      <p className="font-semibold">🌰 {rewards.requester.acorns} Acorns</p>
                      <p className="font-semibold">⭐ {rewards.requester.bp} BP</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Friend receives:</p>
                      <p className="font-semibold">🌰 {rewards.helper.acorns} Acorns</p>
                      <p className="font-semibold">⭐ {rewards.helper.bp} BP</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSendRequest} disabled={loading || !selectedFriend || !selectedTask}>
            {loading ? "Sending..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
