import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Camera, MapPin, Sprout, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import { validateTreeName, MAX_TREE_NAME_LENGTH } from "@/utils/nameValidation";

const TreeEdit = () => {
  const { treeId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [treeName, setTreeName] = useState("");
  const [species, setSpecies] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
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
    if (user && treeId) {
      fetchTreeData();
    }
  }, [user, treeId]);

  const fetchTreeData = async () => {
    if (!user || !treeId) return;

    setFetching(true);
    try {
      const { data, error } = await supabase
        .from("trees")
        .select("name, species, latitude, longitude, photo_url, user_id")
        .eq("id", treeId)
        .single();

      if (error) throw error;

      // Check if current user owns this tree
      if (data.user_id !== user.id) {
        toast({
          title: "Access Denied",
          description: "You can only edit your own trees.",
          variant: "destructive",
        });
        navigate(`/tree/${treeId}`);
        return;
      }

      setTreeName(data.name);
      setSpecies(data.species || "");
      setLatitude(data.latitude.toString());
      setLongitude(data.longitude.toString());
      setCurrentPhotoUrl(data.photo_url);
      setPhotoPreview(data.photo_url);
    } catch (error: any) {
      console.error("Error fetching tree:", error);
      toast({
        title: "Error",
        description: "Failed to load tree data.",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setFetching(false);
    }
  };

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

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
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setPhotoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(currentPhotoUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !treeId) return;

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
      let photoUrl = currentPhotoUrl;

      // Upload new photo if provided
      if (photoFile) {
        setIsUploadingPhoto(true);

        // Delete old photo if it exists
        if (currentPhotoUrl) {
          const oldPhotoPath = currentPhotoUrl.split('/tree-photos/')[1];
          if (oldPhotoPath) {
            await supabase.storage.from("tree-photos").remove([oldPhotoPath]);
          }
        }

        const fileExt = photoFile.name.split(".").pop();
        const filePath = `${user.id}/tree-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("tree-photos")
          .upload(filePath, photoFile, { upsert: true });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("tree-photos")
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
        setIsUploadingPhoto(false);
      }

      const { error } = await supabase.from("trees").update({
        name: treeName.trim(),
        species: species || null,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        photo_url: photoUrl,
      }).eq("id", treeId);

      if (error) throw error;

      toast({
        title: "Tree Updated!",
        description: "Your tree information has been updated successfully.",
      });

      navigate(`/tree/${treeId}`);
    } catch (error: any) {
      toast({
        title: "Failed to update tree",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsUploadingPhoto(false);
    }
  };

  if (fetching) {
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
          <Button variant="ghost" onClick={() => navigate(`/tree/${treeId}`)} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tree Details
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Sprout className="w-16 h-16 mx-auto mb-4 text-primary animate-float" />
            <h1 className="text-3xl font-bold mb-2">Edit Tree</h1>
            <p className="text-muted-foreground">
              Update your tree's information
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tree Details</CardTitle>
              <CardDescription>
                Modify the information about your tree
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

                {/* Photo Upload Section */}
                <div className="space-y-2">
                  <Label htmlFor="tree-photo">Tree Photo (Optional)</Label>
                  {photoPreview ? (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Tree preview"
                        className="w-full h-48 object-cover rounded-lg border-2 border-primary/20"
                      />
                      {photoFile && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={removePhoto}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                      <label htmlFor="tree-photo" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Camera className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Upload a photo of your tree</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              JPEG, PNG, GIF, or WebP (max 5MB)
                            </p>
                          </div>
                        </div>
                        <Input
                          id="tree-photo"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoChange}
                          disabled={loading || isUploadingPhoto}
                        />
                      </label>
                    </div>
                  )}
                  {isUploadingPhoto && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Camera className="w-4 h-4 animate-pulse" />
                      Uploading photo...
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/tree/${treeId}`)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Updating..." : "Update Tree"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TreeEdit;
