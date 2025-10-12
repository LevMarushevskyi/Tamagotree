import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Camera, MapPin, Sprout } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import { validateTreeName, MAX_TREE_NAME_LENGTH } from "@/utils/nameValidation";

const Map = () => {
  const [user, setUser] = useState<User | null>(null);
  const [treeName, setTreeName] = useState("");
  const [species, setSpecies] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [wantToAdopt, setWantToAdopt] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        getCurrentLocation();
      }
    });
  }, [navigate]);

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location access needed",
            description: "Please enable location services or enter coordinates manually.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate tree name
    const treeNameValidation = validateTreeName(treeName);
    if (!treeNameValidation.valid) {
      toast({
        title: "Invalid Tree Name",
        description: treeNameValidation.error,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("trees").insert({
        user_id: wantToAdopt ? user.id : null,
        name: treeName.trim(),
        species: species || null,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        age_days: 0,
        health_status: "healthy",
        xp_earned: 0,
      });

      if (error) throw error;

      toast({
        title: wantToAdopt ? "Tree reported and adopted! 🌱" : "Tree reported! 🌱",
        description: wantToAdopt
          ? "Your sapling has been added to the map and you've adopted it!"
          : "Your sapling has been added to the map and is available for adoption.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Failed to report tree",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Sprout className="w-16 h-16 mx-auto mb-4 text-primary animate-float" />
            <h1 className="text-3xl font-bold mb-2">Report a Tree</h1>
            <p className="text-muted-foreground">
              Add a new sapling to the Tamagotree network
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tree Details</CardTitle>
              <CardDescription>
                Fill in the information about your tree or environmental task
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="tree-name">Tree Name *</Label>
                  <Input
                    id="tree-name"
                    placeholder="e.g., Little Oak, Mighty Maple"
                    value={treeName}
                    onChange={(e) => setTreeName(e.target.value)}
                    maxLength={MAX_TREE_NAME_LENGTH}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Max {MAX_TREE_NAME_LENGTH} characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="species">Species (Optional)</Label>
                  <Input
                    id="species"
                    placeholder="e.g., Oak, Maple, Pine"
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude *</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="35.9940"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude *</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="-78.8986"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  className="w-full"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Use Current Location
                </Button>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <Checkbox
                      id="adopt-tree"
                      checked={wantToAdopt}
                      onCheckedChange={(checked) => setWantToAdopt(checked as boolean)}
                      className="mt-0.5"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="adopt-tree"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        I want to adopt this tree
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        By adopting this tree, you'll be responsible for its care and earn XP for completing tasks.
                        If unchecked, the tree will be available for others to adopt on the map.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-start gap-3">
                      <Camera className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium mb-1">Photo Upload (Coming Soon)</p>
                        <p>
                          Snap a photo of your tree to track its growth over time. This feature
                          will be available in the next update!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Reporting..." : "Report Tree"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Durham Heat Map Integration
            </h3>
            <p className="text-sm text-muted-foreground">
              Once heat map data is integrated, you'll receive automated watering reminders
              based on vapor pressure deficit (VPD) and night cooling forecasts for your
              tree's location.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Map;
