import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Decoration {
  id: string;
  name: string;
  display_name: string;
  image_url: string;
}

interface PlacedDecoration {
  id: string;
  decoration_id: string;
  position_x: number;
  position_y: number;
  decoration: Decoration;
}

interface TreeDecorationsProps {
  treeId: string;
  isOwner: boolean;
  userId: string | null;
  onDecorationsChange?: () => void;
}

export const TreeDecorations = ({ treeId, isOwner, userId, onDecorationsChange }: TreeDecorationsProps) => {
  const { toast } = useToast();
  const [placedDecorations, setPlacedDecorations] = useState<PlacedDecoration[]>([]);
  const [ownedDecorations, setOwnedDecorations] = useState<Decoration[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDecorations();
  }, [treeId, userId]);

  const fetchDecorations = async () => {
    try {
      // Fetch decorations placed on this tree
      const { data: placedData, error: placedError } = await supabase
        .from("tree_decorations")
        .select(`
          id,
          decoration_id,
          position_x,
          position_y,
          decoration:decorations(id, name, display_name, image_url)
        `)
        .eq("tree_id", treeId);

      if (placedError) throw placedError;
      setPlacedDecorations(placedData as unknown as PlacedDecoration[] || []);

      // If owner, fetch their owned decorations
      if (isOwner && userId) {
        const { data: ownedData, error: ownedError } = await supabase
          .from("user_decorations")
          .select(`
            decoration:decorations(id, name, display_name, image_url)
          `)
          .eq("user_id", userId);

        if (ownedError) throw ownedError;
        setOwnedDecorations(
          ownedData?.map((item: any) => item.decoration).filter(Boolean) || []
        );
      }
    } catch (error) {
      console.error("Error fetching decorations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDecoration = async (decorationId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("tree_decorations")
        .insert({
          tree_id: treeId,
          decoration_id: decorationId,
          position_x: 0,
          position_y: 0,
        });

      if (error) throw error;

      toast({
        title: "Decoration Added!",
        description: "Your decoration has been added to the tree. Position it on the tree photo above!",
      });

      await fetchDecorations();
      if (onDecorationsChange) {
        onDecorationsChange();
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Error adding decoration:", error);
      toast({
        title: "Failed to Add",
        description: "Could not add decoration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveDecoration = async (placedDecorationId: string) => {
    try {
      const { error } = await supabase
        .from("tree_decorations")
        .delete()
        .eq("id", placedDecorationId);

      if (error) throw error;

      toast({
        title: "Decoration Removed",
        description: "The decoration has been removed from the tree.",
      });

      await fetchDecorations();
    } catch (error) {
      console.error("Error removing decoration:", error);
      toast({
        title: "Failed to Remove",
        description: "Could not remove decoration. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter out decorations already placed on this tree
  const availableDecorations = ownedDecorations.filter(
    (owned) => !placedDecorations.some((placed) => placed.decoration_id === owned.id)
  );

  if (loading) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Tree Decorations
            </CardTitle>
            <CardDescription>
              {isOwner
                ? "Customize your tree with decorations from the shop"
                : "See how this tree is decorated"}
            </CardDescription>
          </div>
          {isOwner && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Decoration</DialogTitle>
                  <DialogDescription>
                    Choose from your collection to decorate this tree
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {availableDecorations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No decorations available</p>
                      <p className="text-sm mt-2">Visit the shop to purchase decorations!</p>
                    </div>
                  ) : (
                    availableDecorations.map((decoration) => (
                      <Card key={decoration.id} className="cursor-pointer hover:border-primary transition-colors">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={decoration.image_url}
                              alt={decoration.display_name}
                              className="w-12 h-12 image-rendering-pixelated"
                              style={{ imageRendering: 'pixelated' }}
                            />
                            <span className="font-medium">{decoration.display_name}</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddDecoration(decoration.id)}
                          >
                            Add
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {placedDecorations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No decorations yet</p>
            {isOwner && (
              <p className="text-sm mt-2">Add some decorations to make your tree unique!</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {placedDecorations.map((placed) => (
              <div key={placed.id} className="relative group">
                <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted">
                  <img
                    src={placed.decoration.image_url}
                    alt={placed.decoration.display_name}
                    className="w-16 h-16 image-rendering-pixelated"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <Badge variant="secondary" className="text-xs">
                    {placed.decoration.display_name}
                  </Badge>
                  {isOwner && (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveDecoration(placed.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
