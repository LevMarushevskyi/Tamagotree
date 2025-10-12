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
import { ArrowLeft, Award, TreePine, Trophy, Sprout, Star, Trash2, Settings as SettingsIcon, Eye, EyeOff, Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

interface Profile {
  username: string;
  total_xp: number;
  level: number;
  created_at: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [treeCount, setTreeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

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
      loadSettings();
    }
  }, [user]);

  // Load settings from localStorage
  const loadSettings = () => {
    const savedSettings = localStorage.getItem('tomagotree-settings');
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
    const savedSettings = localStorage.getItem('tomagotree-settings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings[key] = value;
    localStorage.setItem('tomagotree-settings', JSON.stringify(settings));
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
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
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
        .from("trees")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (error) throw error;
      setTreeCount(count || 0);
    } catch (error) {
      console.error("Error fetching tree count:", error);
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

  const xpToNextLevel = profile ? profile.level * 100 : 100;
  const xpProgress = profile ? (profile.total_xp % 100) : 0;
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
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl font-bold text-white">
                  {profile?.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">{profile?.username}</h1>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge variant="secondary" className="text-sm">
                      <Trophy className="w-3 h-3 mr-1" />
                      Level {profile?.level}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      <Star className="w-3 h-3 mr-1" />
                      {profile?.total_xp} XP
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      Member since {memberSince}
                    </Badge>
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
          </div>

          {/* XP Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Level Progress</CardTitle>
              <CardDescription>
                {xpProgress} / {xpToNextLevel} XP until Level {(profile?.level || 1) + 1}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={(xpProgress / xpToNextLevel) * 100} className="h-4" />
            </CardContent>
          </Card>

          {/* Achievements (Coming Soon) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Achievements
              </CardTitle>
              <CardDescription>Unlock badges and rewards for your efforts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "First Tree", icon: Sprout, unlocked: treeCount > 0 },
                  { name: "Tree Collector", icon: TreePine, unlocked: treeCount >= 5 },
                  { name: "XP Master", icon: Award, unlocked: (profile?.total_xp || 0) >= 100 },
                  { name: "Level 5", icon: Trophy, unlocked: (profile?.level || 0) >= 5 },
                ].map((achievement, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg text-center transition-all ${
                      achievement.unlocked
                        ? "bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/50"
                        : "bg-muted/50 opacity-50"
                    }`}
                  >
                    <achievement.icon
                      className={`w-10 h-10 mx-auto mb-2 ${
                        achievement.unlocked ? "text-primary animate-pulse-glow" : "text-muted-foreground"
                      }`}
                    />
                    <div className="text-sm font-medium">{achievement.name}</div>
                  </div>
                ))}
              </div>
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
                  <div className="pl-6">
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
