import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, TreePine, MapPin, Heart, Star, Sprout, Clock, Edit, Trash2, User as UserIcon, Target, Flag, Camera, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

interface Tree {
  name: string;
  species: string | null;
  latitude: number;
  longitude: number;
  photo_url: string | null;
  age_days: number;
  health_status: string;
  health_percentage: number;
  level: number;
  xp_earned: number;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

interface Profile {
  avatar_url: string | null;
  username: string;
}

interface Quest {
  id: string;
  name: string;
  description: string;
  quest_type: string;
  category: string | null;
  acorn_reward: number | null;
  bp_reward: number | null;
  xp_reward: number | null;
  tree_specific: boolean | null;
  icon: string | null;
}

interface UserQuest {
  id: string;
  quest_id: string;
  completed: boolean | null;
  completed_at: string | null;
  last_reset_at: string;
  quests: Quest;
}

const TreeDetail = () => {
  const { treeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tree, setTree] = useState<Tree | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [dailyQuests, setDailyQuests] = useState<UserQuest[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(false);
  const [questDialogOpen, setQuestDialogOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<{ userQuestId: string; quest: Quest } | null>(null);
  const [questPhoto, setQuestPhoto] = useState<File | null>(null);
  const [questPhotoPreview, setQuestPhotoPreview] = useState<string | null>(null);
  const [isCompletingQuest, setIsCompletingQuest] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url, username")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    if (treeId) {
      fetchTreeDetails();
    }
  }, [treeId]);

  // Fetch quests when both tree and currentUser are available
  useEffect(() => {
    if (tree && currentUser && tree.user_id === currentUser.id) {
      fetchDailyQuests();
    }
  }, [tree, currentUser]);

  const fetchTreeDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("tree")
        .select("name, species, latitude, longitude, photo_url, age_days, health_status, health_percentage, level, xp_earned, created_at, updated_at, user_id")
        .eq("id", treeId)
        .single();

      if (error) throw error;
      setTree(data);
    } catch (error: any) {
      console.error("Error fetching tree:", error);
      toast({
        title: "Error loading tree",
        description: "Could not load tree details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyQuests = async () => {
    if (!treeId || !currentUser) return;

    setLoadingQuests(true);
    try {
      // First, get all daily quests
      const { data: allQuests, error: questsError } = await supabase
        .from("quests")
        .select("*")
        .eq("quest_type", "daily")
        .eq("tree_specific", true);

      if (questsError) throw questsError;

      // Then get user's progress on these quests for this tree
      const { data: userProgress, error: progressError } = await supabase
        .from("user_quests")
        .select("*, quests(*)")
        .eq("user_id", currentUser.id)
        .eq("tree_id", treeId);

      if (progressError) throw progressError;

      // Check if quests need to be reset (18 hours have passed)
      const now = new Date();
      const resetPromises = userProgress?.map(async (uq) => {
        const lastReset = new Date(uq.last_reset_at);
        const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

        if (hoursSinceReset >= 18 && uq.completed) {
          // Reset the quest
          const { error } = await supabase
            .from("user_quests")
            .update({
              completed: false,
              completed_at: null,
              last_reset_at: now.toISOString(),
            })
            .eq("id", uq.id);

          if (error) console.error("Error resetting quest:", error);
          return { ...uq, completed: false, completed_at: null, last_reset_at: now.toISOString() };
        }
        return uq;
      }) || [];

      const resetProgress = await Promise.all(resetPromises);

      // Create user_quests entries for any quests the user hasn't started yet
      const existingQuestIds = resetProgress.map((uq) => uq.quest_id);
      const newQuests = allQuests?.filter((q) => !existingQuestIds.includes(q.id)) || [];

      if (newQuests.length > 0) {
        const { data: inserted, error: insertError } = await supabase
          .from("user_quests")
          .insert(
            newQuests.map((q) => ({
              user_id: currentUser.id,
              quest_id: q.id,
              tree_id: treeId,
              completed: false,
            }))
          )
          .select("*, quests(*)");

        if (insertError) throw insertError;

        setDailyQuests([...resetProgress, ...(inserted || [])] as UserQuest[]);
      } else {
        setDailyQuests(resetProgress as UserQuest[]);
      }
    } catch (error) {
      console.error("Error fetching quests:", error);
    } finally {
      setLoadingQuests(false);
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 70) return "text-green-600";
    if (health >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthBgColor = (health: number) => {
    if (health >= 70) return "bg-green-500";
    if (health >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleDelete = async () => {
    if (!treeId) return;

    setIsDeleting(true);
    try {
      // Delete the tree's photo if it exists
      if (tree?.photo_url) {
        const photoPath = tree.photo_url.split('/tree-photos/')[1];
        if (photoPath) {
          await supabase.storage.from('tree-photos').remove([photoPath]);
        }
      }

      // Delete the tree from database
      const { error } = await supabase
        .from('tree')
        .delete()
        .eq('id', treeId);

      if (error) throw error;

      toast({
        title: "Tree Deleted",
        description: "The tree has been successfully removed.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error deleting tree:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete tree. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    navigate(`/tree/${treeId}/edit`);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQuestPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setQuestPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setQuestPhoto(null);
    setQuestPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openQuestDialog = (userQuestId: string, quest: Quest) => {
    setSelectedQuest({ userQuestId, quest });
    setQuestDialogOpen(true);
  };

  const closeQuestDialog = () => {
    setQuestDialogOpen(false);
    setSelectedQuest(null);
    setQuestPhoto(null);
    setQuestPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCompleteQuest = async (userQuestId: string, quest: Quest) => {
    if (!currentUser || !treeId || !tree) return;

    setIsCompletingQuest(true);

    try {
      const now = new Date().toISOString();
      let photoUrl: string | null = null;

      // Upload photo if provided
      if (questPhoto) {
        const fileExt = questPhoto.name.split('.').pop();
        const fileName = `${currentUser.id}/${treeId}/${userQuestId}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('quest-photos')
          .upload(fileName, questPhoto);

        if (uploadError) {
          console.error("Photo upload error:", uploadError);
          toast({
            title: "Photo Upload Failed",
            description: "Could not upload photo, but quest will still be completed.",
            variant: "destructive",
          });
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('quest-photos')
            .getPublicUrl(fileName);
          photoUrl = publicUrl;
        }
      }

      // Mark quest as completed
      const { error: questError } = await supabase
        .from("user_quests")
        .update({
          completed: true,
          completed_at: now,
        })
        .eq("id", userQuestId);

      if (questError) throw questError;

      // Award rewards
      const acornReward = quest.acorn_reward || 0;
      const bpReward = quest.bp_reward || 0;
      const xpReward = quest.xp_reward || 0;

      // Update user profile (acorns and XP)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("acorns, total_xp")
        .eq("id", currentUser.id)
        .single();

      if (profileData) {
        await supabase
          .from("profiles")
          .update({
            acorns: profileData.acorns + acornReward,
            total_xp: profileData.total_xp + xpReward,
          })
          .eq("id", currentUser.id);
      }

      // Update tree (BP and health)
      const newTreeXp = tree.xp_earned + bpReward;
      const newHealth = Math.min(100, tree.health_percentage + 10); // Boost health by 10%

      const { error: treeError } = await supabase
        .from("tree")
        .update({
          xp_earned: newTreeXp,
          health_percentage: newHealth,
          health_status: newHealth >= 70 ? "healthy" : newHealth >= 40 ? "needs_care" : "critical",
        })
        .eq("id", treeId);

      if (treeError) throw treeError;

      // Update local state
      setTree({
        ...tree,
        xp_earned: newTreeXp,
        health_percentage: newHealth,
        health_status: newHealth >= 70 ? "healthy" : newHealth >= 40 ? "needs_care" : "critical",
      });

      // Refresh quests
      await fetchDailyQuests();

      // Close dialog
      closeQuestDialog();

      toast({
        title: "Quest Completed!",
        description: `You earned ${acornReward} acorns, ${bpReward} BP, and ${xpReward} XP!${photoUrl ? " Photo uploaded successfully!" : ""}`,
      });
    } catch (error) {
      console.error("Error completing quest:", error);
      toast({
        title: "Error",
        description: "Failed to complete quest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompletingQuest(false);
    }
  };

  const handleReportIssue = async () => {
    if (!currentUser || !treeId || !tree) {
      toast({
        title: "Authentication Required",
        description: "Please log in to report an issue.",
        variant: "destructive",
      });
      return;
    }

    if (!reportReason) {
      toast({
        title: "Reason Required",
        description: "Please select a reason for the report.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReport(true);
    try {
      // Insert report into database
      const { error } = await supabase.from("tree_reports").insert({
        tree_id: treeId,
        reporter_id: currentUser.id,
        reason: reportReason,
        details: reportDetails.trim() || null,
      });

      if (error) throw error;

      // Get reporter's username
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", currentUser.id)
        .single();

      // Call edge function to create GitHub issue
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Session exists:", !!session);

      if (session) {
        try {
          console.log("Calling edge function with data:", {
            tree_id: treeId,
            tree_name: tree.name,
            reason: reportReason,
            reporter_username: profileData?.username || "Unknown",
          });

          const response = await supabase.functions.invoke("create-tree-report-issue", {
            body: {
              tree_id: treeId,
              tree_name: tree.name,
              reason: reportReason,
              details: reportDetails.trim() || null,
              reporter_username: profileData?.username || "Unknown",
              tree_location: {
                latitude: tree.latitude,
                longitude: tree.longitude,
              },
            },
          });

          console.log("Edge function response:", response);

          if (response.error) {
            console.error("Failed to create GitHub issue:", response.error);
            // Don't fail the whole operation if GitHub issue creation fails
          } else {
            console.log("GitHub issue created successfully:", response.data);
          }
        } catch (githubError) {
          console.error("Error calling edge function:", githubError);
          // Continue even if GitHub issue creation fails
        }
      } else {
        console.warn("No session found, skipping GitHub issue creation");
      }

      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep our tree data accurate. We'll review this report soon.",
      });

      setReportDialogOpen(false);
      setReportReason("");
      setReportDetails("");
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast({
        title: "Report Failed",
        description: error.message || "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Check if current user is the owner of this tree
  const isOwner = currentUser && tree?.user_id === currentUser.id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-primary/5">
        <TreePine className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!tree) {
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
            <h1 className="text-2xl font-bold">Tree Not Found</h1>
            <p className="text-muted-foreground mt-2">The tree you're looking for doesn't exist.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          {/* Left: Back to Map */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <MapPin className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Map</span>
          </Button>

          {/* Center: Tree Title (on mobile, hide on desktop) */}
          <div className="flex items-center gap-2 sm:hidden">
            <TreePine className="w-5 h-5 text-primary" />
          </div>

          {/* Right: Edit/Delete buttons (if owner) OR Report Issue (if not owner), and Profile */}
          <div className="flex items-center gap-2">
            {isOwner ? (
              <>
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isDeleting}>
                      <Trash2 className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">{isDeleting ? "Deleting..." : "Delete"}</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{tree.name}" and all associated data.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Tree
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              currentUser && (
                <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Flag className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Report Issue</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Report an Issue</DialogTitle>
                      <DialogDescription>
                        Help us maintain accurate tree data by reporting any issues you've noticed.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="reason">Issue Type *</Label>
                        <Select value={reportReason} onValueChange={setReportReason}>
                          <SelectTrigger id="reason">
                            <SelectValue placeholder="Select an issue type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fake">Fake Tree - This tree doesn't exist</SelectItem>
                            <SelectItem value="duplicate">Duplicate - This tree is already listed</SelectItem>
                            <SelectItem value="wrong_location">Wrong Location - Incorrect coordinates</SelectItem>
                            <SelectItem value="incorrect_info">Incorrect Information - Wrong species, name, etc.</SelectItem>
                            <SelectItem value="inappropriate">Inappropriate Content - Offensive name or photo</SelectItem>
                            <SelectItem value="other">Other Issue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="details">Additional Details (Optional)</Label>
                        <Textarea
                          id="details"
                          placeholder="Provide any additional information that might help us review this report..."
                          value={reportDetails}
                          onChange={(e) => setReportDetails(e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setReportDialogOpen(false)}
                        disabled={isSubmittingReport}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleReportIssue}
                        disabled={isSubmittingReport || !reportReason}
                      >
                        {isSubmittingReport ? "Submitting..." : "Submit Report"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )
            )}

            {/* Profile Picture */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-10 h-10 p-0 overflow-hidden"
              onClick={() => navigate('/profile')}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {profile?.username?.charAt(0).toUpperCase() || <UserIcon className="w-5 h-5" />}
                  </span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="text-center mb-8">
            <TreePine className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-2">{tree.name}</h1>
            {tree.species && (
              <p className="text-xl text-muted-foreground italic">{tree.species}</p>
            )}
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant={tree.user_id ? "default" : "secondary"}>
                {tree.user_id ? "Adopted" : "Available for Adoption"}
              </Badge>
              <Badge variant="outline" className={getHealthColor(tree.health_percentage)}>
                {tree.health_status}
              </Badge>
            </div>
          </div>

          {/* Photo Section */}
          {tree.photo_url && (
            <Card>
              <CardContent className="pt-6">
                <img
                  src={tree.photo_url}
                  alt={tree.name}
                  className="w-full h-auto max-h-96 object-cover rounded-lg shadow-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{tree.level}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-green-500" />
                  Bloom Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{tree.xp_earned}</p>
                <p className="text-sm text-muted-foreground">BP</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Age
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{tree.age_days}</p>
                <p className="text-sm text-muted-foreground">days</p>
              </CardContent>
            </Card>
          </div>

          {/* Health Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Health Status
              </CardTitle>
              <CardDescription>Current health and wellbeing of your tree</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Health Percentage</span>
                  <span className={`text-lg font-bold ${getHealthColor(tree.health_percentage)}`}>
                    {tree.health_percentage}%
                  </span>
                </div>
                <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getHealthBgColor(tree.health_percentage)}`}
                    style={{ width: `${tree.health_percentage}%` }}
                  />
                </div>
              </div>
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Status: <span className={`font-semibold ${getHealthColor(tree.health_percentage)}`}>
                    {tree.health_status}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Location Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                Location
              </CardTitle>
              <CardDescription>Geographic coordinates of this tree</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Latitude</p>
                  <p className="text-lg font-mono">{Number(tree.latitude).toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Longitude</p>
                  <p className="text-lg font-mono">{Number(tree.longitude).toFixed(6)}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => window.open(`https://www.google.com/maps?q=${tree.latitude},${tree.longitude}`, "_blank")}
              >
                <MapPin className="w-4 h-4 mr-2" />
                View on Google Maps
              </Button>
            </CardContent>
          </Card>

          {/* Quests Section - Only visible to owner */}
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-500" />
                  Daily Care Quests
                </CardTitle>
                <CardDescription>Complete quests to earn rewards and boost your tree's health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingQuests ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sprout className="w-12 h-12 mx-auto mb-4 animate-pulse" />
                    <p>Loading quests...</p>
                  </div>
                ) : dailyQuests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No active quests at the moment.</p>
                    <p className="text-sm mt-2">Check back soon for new challenges!</p>
                  </div>
                ) : (
                  dailyQuests.map((userQuest) => {
                    const quest = userQuest.quests;
                    const isCompleted = userQuest.completed;

                    return (
                      <Card key={userQuest.id} className={isCompleted ? "opacity-60 bg-muted/50" : "border-primary/20"}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-2xl">{quest.icon}</span>
                                <h3 className="font-semibold">{quest.name}</h3>
                                {isCompleted && (
                                  <Badge variant="secondary" className="ml-auto">Completed</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{quest.description}</p>
                              <div className="flex flex-wrap gap-2 text-xs">
                                {quest.acorn_reward && quest.acorn_reward > 0 && (
                                  <Badge variant="outline" className="gap-1">
                                    🪙 {quest.acorn_reward} Acorns
                                  </Badge>
                                )}
                                {quest.bp_reward && quest.bp_reward > 0 && (
                                  <Badge variant="outline" className="gap-1">
                                    🌱 {quest.bp_reward} BP
                                  </Badge>
                                )}
                                {quest.xp_reward && quest.xp_reward > 0 && (
                                  <Badge variant="outline" className="gap-1">
                                    ⭐ {quest.xp_reward} XP
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              disabled={isCompleted}
                              onClick={() => openQuestDialog(userQuest.id, quest)}
                              className="shrink-0"
                            >
                              {isCompleted ? "Done" : "Complete"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Quest Completion Dialog */}
      <Dialog open={questDialogOpen} onOpenChange={setQuestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedQuest?.quest.icon}</span>
              Complete Quest: {selectedQuest?.quest.name}
            </DialogTitle>
            <DialogDescription>
              Upload an optional photo of your completed task
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Photo Upload Section */}
            <div className="space-y-3">
              <Label htmlFor="quest-photo" className="text-sm font-medium">
                Photo (Optional)
              </Label>

              {questPhotoPreview ? (
                <div className="relative">
                  <img
                    src={questPhotoPreview}
                    alt="Quest preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemovePhoto}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Click to upload a photo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Optional: Show proof of your quest completion
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                id="quest-photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>

            {/* Rewards Preview */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Rewards</Label>
              <div className="flex flex-wrap gap-2">
                {selectedQuest?.quest.acorn_reward && selectedQuest.quest.acorn_reward > 0 && (
                  <Badge variant="outline" className="gap-1">
                    🪙 {selectedQuest.quest.acorn_reward} Acorns
                  </Badge>
                )}
                {selectedQuest?.quest.bp_reward && selectedQuest.quest.bp_reward > 0 && (
                  <Badge variant="outline" className="gap-1">
                    🌱 {selectedQuest.quest.bp_reward} BP
                  </Badge>
                )}
                {selectedQuest?.quest.xp_reward && selectedQuest.quest.xp_reward > 0 && (
                  <Badge variant="outline" className="gap-1">
                    ⭐ {selectedQuest.quest.xp_reward} XP
                  </Badge>
                )}
                <Badge variant="outline" className="gap-1">
                  ❤️ +10% Health
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={closeQuestDialog}
              disabled={isCompletingQuest}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedQuest && handleCompleteQuest(selectedQuest.userQuestId, selectedQuest.quest)}
              disabled={isCompletingQuest}
            >
              {isCompletingQuest ? "Completing..." : "Complete Quest"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TreeDetail;
