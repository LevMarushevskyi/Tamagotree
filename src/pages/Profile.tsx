import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
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
import { ArrowLeft, Award, TreePine, Trophy, Sprout, Star, Trash2, Settings as SettingsIcon, Eye, Moon, Sun, Volume2, VolumeX, Edit as EditIcon, Camera, Save, X, LogOut, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import { checkLevelUp, calculateLevelProgress } from "@/utils/xpCalculations";
import { checkTreeAchievements, checkAcornAchievements, checkLeaderboardAchievements } from "@/utils/achievementChecks";

interface Profile {
  username: string;
  avatar_url: string | null;
  bio: string | null;
  total_xp: number;
  level: number;
  guardian_rank: string;
  acorns: number;
  created_at: string;
}

interface LeaderboardRank {
  acorns: number | null;
  totalXp: number | null;
  treeBp: number | null;
}

interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  xp_requirement: number | null;
}

interface UserAchievement {
  achievement_id: string;
  unlocked_at: string;
  achievements: Achievement;
}

interface Tree {
  id: string;
  name: string;
  species: string | null;
  age_days: number;
  health_status: string;
  photo_url: string | null;
  xp_earned: number;
  created_at: string;
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
  progress: number | null;
  quests: Quest;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [treeCount, setTreeCount] = useState(0);
  const [adoptedTrees, setAdoptedTrees] = useState<Tree[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [leaderboardRanks, setLeaderboardRanks] = useState<LeaderboardRank>({
    acorns: null,
    totalXp: null,
    treeBp: null,
  });
  const [weeklyQuests, setWeeklyQuests] = useState<UserQuest[]>([]);
  const [questProgress, setQuestProgress] = useState<Map<string, { current: number; target: number }>>(new Map());
  const [loadingQuests, setLoadingQuests] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bio editing state
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [isSavingBio, setIsSavingBio] = useState(false);

  // Profile picture state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Settings state
  const [profileVisible, setProfileVisible] = useState(true);
  const [treesVisible, setTreesVisible] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [sfxVolume, setSfxVolume] = useState([70]);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTreeCount();
      fetchAdoptedTrees();
      fetchAchievements();
      fetchLeaderboardRanks();
      fetchWeeklyQuests();
      loadSettings();
    }
  }, [user]);

  // Check achievements after data is loaded
  useEffect(() => {
    if (user && profile) {
      checkAllAchievements();
    }
  }, [user, treeCount]);

  // Load settings from localStorage
  const loadSettings = () => {
    const savedSettings = localStorage.getItem('tamagotree-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setProfileVisible(settings.profileVisible ?? true);
      setTreesVisible(settings.treesVisible ?? true);
      setDarkMode(settings.darkMode ?? false);
      setSfxEnabled(settings.sfxEnabled ?? true);
      setSfxVolume([settings.sfxVolume ?? 70]);
    }
  };

  // Save settings to localStorage
  const saveSettings = (key: string, value: any) => {
    const savedSettings = localStorage.getItem('tamagotree-settings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings[key] = value;
    localStorage.setItem('tamagotree-settings', JSON.stringify(settings));
  };

  const handleProfileVisibilityChange = (checked: boolean) => {
    setProfileVisible(checked);
    saveSettings('profileVisible', checked);
    toast({
      title: "Profile Visibility Updated",
      description: checked ? "Your profile is now public" : "Your profile is now private",
    });
  };

  const handleTreesVisibilityChange = (checked: boolean) => {
    setTreesVisible(checked);
    saveSettings('treesVisible', checked);
    toast({
      title: "Trees Visibility Updated",
      description: checked ? "Your trees are now public" : "Your trees are now private",
    });
  };

  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    saveSettings('darkMode', checked);
    // Apply dark mode class to document
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast({
      title: "Theme Updated",
      description: checked ? "Dark mode enabled" : "Light mode enabled",
    });
  };

  const handleSfxEnabledChange = (checked: boolean) => {
    setSfxEnabled(checked);
    saveSettings('sfxEnabled', checked);
    toast({
      title: "Sound Effects Updated",
      description: checked ? "Sound effects enabled" : "Sound effects disabled",
    });
  };

  const handleSfxVolumeChange = (value: number[]) => {
    setSfxVolume(value);
    saveSettings('sfxVolume', value[0]);
  };

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url, bio, total_xp, level, guardian_rank, acorns, created_at")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setBioText(data.bio || "");
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTreeCount = async () => {
    if (!user) return;

    try {
      const { count, error } = await supabase
        .from("tree")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (error) throw error;
      setTreeCount(count || 0);
    } catch (error) {
      console.error("Error fetching tree count:", error);
    }
  };

  const fetchAdoptedTrees = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("tree")
        .select("id, name, species, age_days, health_status, photo_url, xp_earned, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAdoptedTrees(data || []);
    } catch (error) {
      console.error("Error fetching adopted trees:", error);
    }
  };

  const fetchAchievements = async () => {
    if (!user) return;

    try {
      // Fetch all achievements
      const { data: allAch, error: allError } = await supabase
        .from("achievements")
        .select("*")
        .order("xp_requirement", { ascending: true });

      if (allError) throw allError;
      setAllAchievements(allAch || []);

      // Fetch user's unlocked achievements
      const { data: userAch, error: userError } = await supabase
        .from("user_achievements")
        .select(`
          achievement_id,
          unlocked_at,
          achievements:achievement_id (
            id,
            name,
            description,
            icon,
            xp_requirement
          )
        `)
        .eq("user_id", user.id);

      if (userError) throw userError;
      setUserAchievements(userAch || []);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  };

  const checkAllAchievements = async () => {
    if (!user) return;

    try {
      // Check tree-based achievements
      await checkTreeAchievements(user.id);

      // Check acorn-based achievements
      if (profile) {
        await checkAcornAchievements(user.id, profile.acorns);
      }

      // Check leaderboard achievements
      if (leaderboardRanks.acorns) {
        await checkLeaderboardAchievements(user.id, leaderboardRanks.acorns);
      }

      // Refresh achievements to show newly unlocked ones
      await fetchAchievements();
    } catch (error) {
      console.error("Error checking achievements:", error);
    }
  };

  const getWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday as start of week
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart.toISOString();
  };

  const fetchLeaderboardRanks = async () => {
    if (!user) return;

    try {
      const weekStart = getWeekStart();

      // Fetch Acorns rank
      const { data: acornsData, error: acornsError } = await supabase
        .from("profiles")
        .select("id, acorns")
        .order("acorns", { ascending: false });

      if (acornsError) throw acornsError;
      const acornsRank = acornsData.findIndex((p) => p.id === user.id) + 1;

      // Fetch Total XP rank
      const { data: xpData, error: xpError } = await supabase
        .from("profiles")
        .select("id, total_xp")
        .order("total_xp", { ascending: false });

      if (xpError) throw xpError;
      const xpRank = xpData.findIndex((p) => p.id === user.id) + 1;

      // Fetch Tree BP rank (this week)
      const { data: bpData, error: bpError } = await supabase
        .from("tree")
        .select("user_id, xp_earned")
        .gte("created_at", weekStart);

      if (bpError) throw bpError;

      // Group by user_id and sum xp_earned
      const userBpMap = new Map<string, number>();
      bpData.forEach((tree) => {
        const currentBp = userBpMap.get(tree.user_id) || 0;
        userBpMap.set(tree.user_id, currentBp + tree.xp_earned);
      });

      // Sort by BP and find user's rank
      const sortedBp = Array.from(userBpMap.entries())
        .sort((a, b) => b[1] - a[1]);
      const bpRank = sortedBp.findIndex(([userId]) => userId === user.id) + 1;

      setLeaderboardRanks({
        acorns: acornsRank > 0 ? acornsRank : null,
        totalXp: xpRank > 0 ? xpRank : null,
        treeBp: bpRank > 0 ? bpRank : null,
      });
    } catch (error) {
      console.error("Error fetching leaderboard ranks:", error);
    }
  };

  const getSundayEndOfWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const sunday = new Date(now);
    sunday.setDate(now.getDate() + daysUntilSunday);
    sunday.setHours(23, 59, 59, 999);
    return sunday.toISOString();
  };

  const calculateQuestProgress = async (questName: string): Promise<{ current: number; target: number }> => {
    if (!user) return { current: 0, target: 1 };

    try {
      switch (questName) {
        case "Busy Bee": {
          // Count days this week where user completed at least one daily quest
          const weekStart = getWeekStart();
          const { data: completedQuests } = await supabase
            .from("user_quests")
            .select("completed_at, quests!inner(quest_type)")
            .eq("user_id", user.id)
            .eq("completed", true)
            .gte("completed_at", weekStart)
            .eq("quests.quest_type", "daily");

          // Count unique days
          const uniqueDays = new Set(
            completedQuests?.map((q) => new Date(q.completed_at!).toDateString()) || []
          );
          return { current: uniqueDays.size, target: 7 };
        }

        case "New Life": {
          // Count trees planted this week
          const weekStart = getWeekStart();
          const { count } = await supabase
            .from("tree")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .gte("created_at", weekStart);
          return { current: count || 0, target: 1 };
        }

        case "Social Butterfly": {
          // Friends system not implemented yet
          return { current: 0, target: 1 };
        }

        case "TOP 10!":
        case "TOP 5!":
        case "ON TOP!": {
          // Check leaderboard position for consecutive days
          // For now, return 0 (this needs more complex tracking)
          const target = 3;
          // TODO: Implement consecutive day tracking
          return { current: 0, target };
        }

        default:
          return { current: 0, target: 1 };
      }
    } catch (error) {
      console.error("Error calculating quest progress:", error);
      return { current: 0, target: 1 };
    }
  };

  const fetchWeeklyQuests = async () => {
    if (!user) return;

    setLoadingQuests(true);
    try {
      // Get all weekly quests (excluding Social Butterfly for now)
      const { data: allQuests, error: questsError } = await supabase
        .from("quests")
        .select("*")
        .eq("quest_type", "weekly")
        .eq("tree_specific", false)
        .not("name", "eq", "Social Butterfly"); // Exclude until friends system is implemented

      if (questsError) throw questsError;

      // Get user's progress on weekly quests
      const { data: userProgress, error: progressError } = await supabase
        .from("user_quests")
        .select("*, quests(*)")
        .eq("user_id", user.id)
        .is("tree_id", null);

      if (progressError) throw progressError;

      // Check if quests need to be reset (Sunday 11:59 PM EST)
      const now = new Date();
      const estOffset = -5; // EST is UTC-5
      const estNow = new Date(now.getTime() + estOffset * 60 * 60 * 1000);

      const resetPromises = userProgress?.map(async (uq) => {
        const lastReset = new Date(uq.last_reset_at);
        const lastResetEST = new Date(lastReset.getTime() + estOffset * 60 * 60 * 1000);

        // Check if we've passed a Sunday 11:59 PM EST since last reset
        const daysSinceReset = Math.floor((estNow.getTime() - lastResetEST.getTime()) / (1000 * 60 * 60 * 24));
        const lastResetDayOfWeek = lastResetEST.getDay();
        const currentDayOfWeek = estNow.getDay();

        // Reset if: we're past Sunday AND last reset was before this Sunday
        const shouldReset = currentDayOfWeek === 0 && lastResetDayOfWeek !== 0 && daysSinceReset > 0;

        if (shouldReset && uq.completed) {
          const { error } = await supabase
            .from("user_quests")
            .update({
              completed: false,
              completed_at: null,
              progress: 0,
              last_reset_at: now.toISOString(),
            })
            .eq("id", uq.id);

          if (error) console.error("Error resetting quest:", error);
          return { ...uq, completed: false, completed_at: null, progress: 0, last_reset_at: now.toISOString() };
        }
        return uq;
      }) || [];

      const resetProgress = await Promise.all(resetPromises);

      // Create user_quests entries for new quests
      const existingQuestIds = resetProgress.map((uq) => uq.quest_id);
      const newQuests = allQuests?.filter((q) => !existingQuestIds.includes(q.id)) || [];

      if (newQuests.length > 0) {
        const { data: inserted, error: insertError } = await supabase
          .from("user_quests")
          .insert(
            newQuests.map((q) => ({
              user_id: user.id,
              quest_id: q.id,
              tree_id: null,
              completed: false,
              progress: 0,
            }))
          )
          .select("*, quests(*)");

        if (insertError) throw insertError;

        const allUserQuests = [...resetProgress, ...(inserted || [])] as UserQuest[];

        // Calculate progress for each quest
        const progressMap = new Map<string, { current: number; target: number }>();
        const completionPromises = allUserQuests.map(async (uq) => {
          const quest = uq.quests;
          const progress = await calculateQuestProgress(quest.name);
          progressMap.set(quest.name, progress);

          // Auto-complete quest if progress reaches target and not already completed
          if (progress.current >= progress.target && !uq.completed) {
            await autoCompleteWeeklyQuest(uq.id, quest);
            return { ...uq, completed: true };
          }
          return uq;
        });

        const updatedQuests = await Promise.all(completionPromises);
        setWeeklyQuests(updatedQuests);
        setQuestProgress(progressMap);
      } else {
        const allUserQuests = resetProgress as UserQuest[];

        // Calculate progress for each quest
        const progressMap = new Map<string, { current: number; target: number }>();
        const completionPromises = allUserQuests.map(async (uq) => {
          const quest = uq.quests;
          const progress = await calculateQuestProgress(quest.name);
          progressMap.set(quest.name, progress);

          // Auto-complete quest if progress reaches target and not already completed
          if (progress.current >= progress.target && !uq.completed) {
            await autoCompleteWeeklyQuest(uq.id, quest);
            return { ...uq, completed: true };
          }
          return uq;
        });

        const updatedQuests = await Promise.all(completionPromises);
        setWeeklyQuests(updatedQuests);
        setQuestProgress(progressMap);
      }
    } catch (error) {
      console.error("Error fetching weekly quests:", error);
    } finally {
      setLoadingQuests(false);
    }
  };

  const autoCompleteWeeklyQuest = async (userQuestId: string, quest: Quest) => {
    if (!user) return;

    try {
      const now = new Date().toISOString();

      // Mark quest as completed
      await supabase
        .from("user_quests")
        .update({
          completed: true,
          completed_at: now,
        })
        .eq("id", userQuestId);

      // Award rewards
      const acornReward = quest.acorn_reward || 0;
      const xpReward = quest.xp_reward || 0;

      // Update user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("acorns, total_xp, level")
        .eq("id", user.id)
        .single();

      if (profileData) {
        const newTotalXP = profileData.total_xp + xpReward;
        const levelUpInfo = checkLevelUp(profileData.total_xp, newTotalXP);

        await supabase
          .from("profiles")
          .update({
            acorns: profileData.acorns + acornReward,
            total_xp: newTotalXP,
            level: levelUpInfo.newLevel,
          })
          .eq("id", user.id);

        // Update local profile state to reflect new values
        setProfile((prev) => prev ? {
          ...prev,
          acorns: profileData.acorns + acornReward,
          total_xp: newTotalXP,
          level: levelUpInfo.newLevel,
        } : prev);

        // Show level up notification if leveled up
        if (levelUpInfo.leveledUp) {
          toast({
            title: "🎉 Level Up!",
            description: `You reached level ${levelUpInfo.newLevel}! Quest completed: ${quest.name}`,
          });
        } else {
          toast({
            title: "Weekly Quest Completed!",
            description: `${quest.name} completed! You earned ${acornReward} acorns and ${xpReward} XP!`,
          });
        }

        // Check for newly earned achievements
        await checkAllAchievements();
      }
    } catch (error) {
      console.error("Error auto-completing weekly quest:", error);
    }
  };

  const handleBioSave = async () => {
    if (!user) return;

    setIsSavingBio(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ bio: bioText })
        .eq("id", user.id);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, bio: bioText } : prev));
      setIsEditingBio(false);
      toast({
        title: "Bio Updated",
        description: "Your bio has been saved successfully.",
      });
    } catch (error) {
      console.error("Error updating bio:", error);
      toast({
        title: "Error",
        description: "Failed to update bio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid image file (JPEG, PNG, GIF, or WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const fileExt = file.name.split(".").pop();
    // Use folder structure: {user_id}/{filename}.{ext} to match storage policy
    const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

    setIsUploadingAvatar(true);
    try {
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : prev));
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      const errorMessage = error?.message || "Failed to upload profile picture. Please try again.";
      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Weekly quests are now auto-completed when progress reaches target
  // No manual completion needed

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to delete your account",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw response.error;
      }

      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted. You can re-register with the same email if you wish.",
      });

      // Sign out and redirect to home
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate level progress using the scaling formula
  const levelProgress = profile ? calculateLevelProgress(profile.total_xp) : { level: 1, current: 0, required: 100 };
  const xpToNextLevel = levelProgress.required;
  const xpProgress = levelProgress.current;
  const memberSince = profile ? new Date(profile.created_at).toLocaleDateString() : "";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Sprout className="w-12 h-12 text-primary animate-pulse" />
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
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Profile Picture with Upload */}
                <div className="relative group">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl font-bold text-white">
                      {profile?.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="w-6 h-6 text-white" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                    />
                  </label>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                      <Sprout className="w-6 h-6 text-white animate-pulse" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">{profile?.username}</h1>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                    {leaderboardRanks.acorns && (
                      <Badge
                        variant="secondary"
                        className="text-sm cursor-pointer hover:bg-secondary/80 transition-colors"
                        onClick={() => navigate("/leaderboards")}
                      >
                        <Coins className="w-3 h-3 mr-1" />
                        #{leaderboardRanks.acorns} Acorns
                      </Badge>
                    )}
                    {leaderboardRanks.totalXp && (
                      <Badge
                        variant="secondary"
                        className="text-sm cursor-pointer hover:bg-secondary/80 transition-colors"
                        onClick={() => navigate("/leaderboards")}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        #{leaderboardRanks.totalXp} Total XP
                      </Badge>
                    )}
                    {leaderboardRanks.treeBp && (
                      <Badge
                        variant="secondary"
                        className="text-sm cursor-pointer hover:bg-secondary/80 transition-colors"
                        onClick={() => navigate("/leaderboards")}
                      >
                        <Sprout className="w-3 h-3 mr-1" />
                        #{leaderboardRanks.treeBp} Tree BP
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-sm">
                      Member since {memberSince}
                    </Badge>
                  </div>

                  {/* Level Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Level {profile?.level}</span>
                      <span className="text-sm text-muted-foreground">
                        {xpProgress} / {xpToNextLevel} XP
                      </span>
                    </div>
                    <Progress value={(xpProgress / xpToNextLevel) * 100} className="h-2" />
                  </div>

                  {/* Bio Section */}
                  <div className="mt-4">
                    {isEditingBio ? (
                      <div className="space-y-2">
                        <textarea
                          value={bioText}
                          onChange={(e) => setBioText(e.target.value)}
                          placeholder="Tell others about yourself..."
                          className="w-full p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                          rows={3}
                          maxLength={500}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsEditingBio(false);
                              setBioText(profile?.bio || "");
                            }}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleBioSave}
                            disabled={isSavingBio}
                          >
                            <Save className="w-4 h-4 mr-1" />
                            {isSavingBio ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="group">
                        <p className="text-muted-foreground italic text-sm">
                          {profile?.bio || "No bio yet. Click edit to add one."}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingBio(true)}
                          className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <EditIcon className="w-4 h-4 mr-1" />
                          Edit Bio
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Trees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <TreePine className="w-8 h-8 text-primary" />
                  <div className="text-3xl font-bold">{treeCount}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Current Level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-secondary" />
                  <div className="text-3xl font-bold">{profile?.level}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total XP</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-accent" />
                  <div className="text-3xl font-bold">{profile?.total_xp}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Acorns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Coins className="w-8 h-8 text-amber-600" />
                  <div className="text-3xl font-bold">{profile?.acorns || 0}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Adopted Trees - Private to User */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="w-5 h-5 text-primary" />
                My Adopted Trees
              </CardTitle>
              <CardDescription>
                Trees you're caring for (only visible to you)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {adoptedTrees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sprout className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>You haven't adopted any trees yet.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate("/map")}
                  >
                    Explore the Map
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {adoptedTrees.map((tree) => (
                    <div
                      key={tree.id}
                      className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/tree/${tree.id}`)}
                    >
                      {tree.photo_url && (
                        <img
                          src={tree.photo_url}
                          alt={tree.name}
                          className="w-full h-32 object-cover rounded-md mb-3"
                        />
                      )}
                      <h3 className="font-semibold text-lg mb-1">{tree.name}</h3>
                      {tree.species && (
                        <p className="text-sm text-muted-foreground mb-2">{tree.species}</p>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Badge variant={tree.health_status === "healthy" ? "default" : "destructive"}>
                            {tree.health_status}
                          </Badge>
                        </span>
                        <span className="text-muted-foreground">
                          {tree.age_days} days old
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        <Star className="w-3 h-3 inline mr-1" />
                        {tree.xp_earned} BP earned
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Achievements & Badges
              </CardTitle>
              <CardDescription>
                {userAchievements.length} of {allAchievements.length} unlocked
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allAchievements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No achievements available yet. Check back soon!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {allAchievements.map((achievement) => {
                    const isUnlocked = userAchievements.some(
                      (ua) => ua.achievement_id === achievement.id
                    );
                    const IconComponent = isUnlocked ? Award : Trophy;

                    return (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-lg text-center transition-all ${
                          isUnlocked
                            ? "bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/50"
                            : "bg-muted/50 opacity-50"
                        }`}
                        title={achievement.description || undefined}
                      >
                        {achievement.icon ? (
                          <div className="text-4xl mx-auto mb-2">{achievement.icon}</div>
                        ) : (
                          <IconComponent
                            className={`w-10 h-10 mx-auto mb-2 ${
                              isUnlocked ? "text-primary" : "text-muted-foreground"
                            }`}
                          />
                        )}
                        <div className="text-sm font-medium">{achievement.name}</div>
                        {achievement.xp_requirement !== null && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {achievement.xp_requirement} XP
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Quests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-500" />
                Weekly Quests
              </CardTitle>
              <CardDescription>
                Complete weekly challenges to earn bonus rewards. Resets Sunday 11:59 PM EST.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingQuests ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sprout className="w-12 h-12 mx-auto mb-4 animate-pulse" />
                  <p>Loading quests...</p>
                </div>
              ) : weeklyQuests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No weekly quests available.</p>
                </div>
              ) : (
                weeklyQuests.map((userQuest) => {
                  const quest = userQuest.quests;
                  const isCompleted = userQuest.completed;

                  return (
                    <Card key={userQuest.id} className={isCompleted ? "opacity-60 bg-muted/50" : "border-purple-500/20"}>
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
                            <div className="flex flex-wrap gap-2 text-xs mb-3">
                              {quest.acorn_reward && quest.acorn_reward > 0 && (
                                <Badge variant="outline" className="gap-1">
                                  🪙 {quest.acorn_reward} Acorns
                                </Badge>
                              )}
                              {quest.xp_reward && quest.xp_reward > 0 && (
                                <Badge variant="outline" className="gap-1">
                                  ⭐ {quest.xp_reward} XP
                                </Badge>
                              )}
                            </div>

                            {/* Progress Bar */}
                            {!isCompleted && (() => {
                              const progress = questProgress.get(quest.name);
                              if (!progress) return null;

                              const percentage = (progress.current / progress.target) * 100;

                              return (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium">
                                      {progress.current} / {progress.target}
                                    </span>
                                  </div>
                                  <Progress value={percentage} className="h-2" />
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Impact Section */}
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Your Environmental Impact</CardTitle>
              <CardDescription>Together we're making Durham greener</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Trees Planted</span>
                <span className="text-2xl font-bold text-primary">{treeCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>CO₂ Offset (estimated)</span>
                <span className="text-2xl font-bold text-secondary">{(treeCount * 20).toFixed(0)} kg</span>
              </div>
              <p className="text-sm text-muted-foreground pt-4">
                Each tree you care for contributes to cooling Durham's urban heat islands and
                fighting climate change. Keep up the amazing work! 🌱
              </p>
            </CardContent>
          </Card>

          {/* User Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-primary" />
                Settings
              </CardTitle>
              <CardDescription>Manage your account preferences and privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Privacy Settings */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Privacy & Visibility
                  </h3>
                  <div className="space-y-4 pl-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="profile-visibility" className="text-base">
                          Profile Visibility
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow others to view your profile and stats
                        </p>
                      </div>
                      <Switch
                        id="profile-visibility"
                        checked={profileVisible}
                        onCheckedChange={handleProfileVisibilityChange}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="trees-visibility" className="text-base">
                          Trees Visibility
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Show your trees on the public map
                        </p>
                      </div>
                      <Switch
                        id="trees-visibility"
                        checked={treesVisible}
                        onCheckedChange={handleTreesVisibilityChange}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Theme Settings */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    Appearance
                  </h3>
                  <div className="space-y-4 pl-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="dark-mode" className="text-base">
                          Dark Mode
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Switch between light and dark theme
                        </p>
                      </div>
                      <Switch
                        id="dark-mode"
                        checked={darkMode}
                        onCheckedChange={handleDarkModeChange}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Sound Settings */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    {sfxEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    Sound Effects
                  </h3>
                  <div className="space-y-4 pl-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sfx-enabled" className="text-base">
                          Enable Sound Effects
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Play sounds for actions and notifications
                        </p>
                      </div>
                      <Switch
                        id="sfx-enabled"
                        checked={sfxEnabled}
                        onCheckedChange={handleSfxEnabledChange}
                      />
                    </div>
                    {sfxEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="sfx-volume" className="text-sm">
                          Volume: {sfxVolume[0]}%
                        </Label>
                        <Slider
                          id="sfx-volume"
                          min={0}
                          max={100}
                          step={5}
                          value={sfxVolume}
                          onValueChange={handleSfxVolumeChange}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Danger Zone */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-destructive">
                    <Trash2 className="w-4 h-4" />
                    Danger Zone
                  </h3>
                  <div className="pl-6 space-y-4">
                    {/* Sign Out */}
                    <div className="p-4 border border-muted rounded-lg bg-muted/20">
                      <p className="text-sm text-muted-foreground mb-3">
                        Sign out of your account. You can sign back in anytime.
                      </p>
                      <Button variant="outline" size="sm" onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>

                    {/* Delete Account */}
                    <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                      <p className="text-sm text-muted-foreground mb-3">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={isDeleting}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            {isDeleting ? "Deleting..." : "Delete Account"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your account,
                              including all your trees, tasks, and progress data.
                              <br />
                              <br />
                              However, you can re-register with the same email address in the future if you change your mind.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAccount}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
