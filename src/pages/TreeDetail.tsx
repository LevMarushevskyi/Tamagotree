import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TreePine, MapPin, Calendar, Heart, Star, Sprout, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const TreeDetail = () => {
  const { treeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tree, setTree] = useState<Tree | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (treeId) {
      fetchTreeDetails();
    }
  }, [treeId]);

  const fetchTreeDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("trees")
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
                  XP Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{tree.xp_earned}</p>
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

          {/* Timeline Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                Timeline
              </CardTitle>
              <CardDescription>Important dates and milestones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Created</p>
                <p className="text-base">{formatDate(tree.created_at)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Last Updated</p>
                <p className="text-base">{formatDate(tree.updated_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Photo Section */}
          {tree.photo_url && (
            <Card>
              <CardHeader>
                <CardTitle>Photo</CardTitle>
                <CardDescription>Latest photo of this tree</CardDescription>
              </CardHeader>
              <CardContent>
                <img
                  src={tree.photo_url}
                  alt={tree.name}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default TreeDetail;
