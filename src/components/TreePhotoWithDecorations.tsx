import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { X, Move } from "lucide-react";
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

interface TreePhotoWithDecorationsProps {
  photoUrl: string;
  treeName: string;
  placedDecorations: PlacedDecoration[];
  isOwner: boolean;
  onDecorationMove?: (decorationId: string, x: number, y: number) => void;
  onDecorationRemove?: (decorationId: string) => void;
}

export const TreePhotoWithDecorations = ({
  photoUrl,
  treeName,
  placedDecorations,
  isOwner,
  onDecorationMove,
  onDecorationRemove,
}: TreePhotoWithDecorationsProps) => {
  const { toast } = useToast();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, decoration: PlacedDecoration) => {
    if (!isOwner) return;

    e.preventDefault();
    setDraggingId(decoration.id);

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const decorationX = (decoration.position_x / 100) * rect.width;
      const decorationY = (decoration.position_y / 100) * rect.height;
      setDragOffset({
        x: e.clientX - decorationX - rect.left,
        y: e.clientY - decorationY - rect.top,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    // Convert to percentage
    const percentX = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const percentY = Math.max(0, Math.min(100, (y / rect.height) * 100));

    // Update immediately for smooth dragging
    const decoration = placedDecorations.find(d => d.id === draggingId);
    if (decoration && onDecorationMove) {
      onDecorationMove(draggingId, percentX, percentY);
    }
  };

  const handleMouseUp = async () => {
    if (!draggingId) return;

    const decoration = placedDecorations.find(d => d.id === draggingId);
    if (decoration) {
      try {
        // Save position to database
        const { error } = await supabase
          .from("tree_decorations")
          .update({
            position_x: Math.round(decoration.position_x),
            position_y: Math.round(decoration.position_y),
          })
          .eq("id", draggingId);

        if (error) throw error;

        toast({
          title: "Position Saved",
          description: "Decoration position updated!",
        });
      } catch (error) {
        console.error("Error saving decoration position:", error);
        toast({
          title: "Save Failed",
          description: "Could not save decoration position.",
          variant: "destructive",
        });
      }
    }

    setDraggingId(null);
  };

  const handleTouchStart = (e: React.TouchEvent, decoration: PlacedDecoration) => {
    if (!isOwner) return;

    e.preventDefault();
    setDraggingId(decoration.id);

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const touch = e.touches[0];
      const decorationX = (decoration.position_x / 100) * rect.width;
      const decorationY = (decoration.position_y / 100) * rect.height;
      setDragOffset({
        x: touch.clientX - decorationX - rect.left,
        y: touch.clientY - decorationY - rect.top,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggingId || !containerRef.current) return;

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left - dragOffset.x;
    const y = touch.clientY - rect.top - dragOffset.y;

    const percentX = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const percentY = Math.max(0, Math.min(100, (y / rect.height) * 100));

    const decoration = placedDecorations.find(d => d.id === draggingId);
    if (decoration && onDecorationMove) {
      onDecorationMove(draggingId, percentX, percentY);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {/* Tree Photo */}
      <img
        src={photoUrl}
        alt={treeName}
        className="w-full h-auto max-h-96 object-cover rounded-lg shadow-lg"
        draggable={false}
      />

      {/* Decorations Overlay */}
      {placedDecorations.map((decoration) => (
        <div
          key={decoration.id}
          className={`absolute group ${isOwner ? 'cursor-move' : ''}`}
          style={{
            left: `${decoration.position_x}%`,
            top: `${decoration.position_y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: draggingId === decoration.id ? 50 : 10,
          }}
          onMouseDown={(e) => handleMouseDown(e, decoration)}
          onTouchStart={(e) => handleTouchStart(e, decoration)}
        >
          {/* Decoration Image */}
          <img
            src={decoration.decoration.image_url}
            alt={decoration.decoration.display_name}
            className="w-12 h-12 image-rendering-pixelated pointer-events-none select-none"
            style={{ imageRendering: 'pixelated' }}
            draggable={false}
          />

          {/* Remove Button (only visible on hover for owners) */}
          {isOwner && (
            <Button
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                if (onDecorationRemove) {
                  onDecorationRemove(decoration.id);
                }
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          )}

          {/* Drag Indicator */}
          {isOwner && draggingId === decoration.id && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs whitespace-nowrap">
              <Move className="w-3 h-3 inline mr-1" />
              Drag to position
            </div>
          )}
        </div>
      ))}

      {/* Instructions for owners */}
      {isOwner && placedDecorations.length > 0 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded text-xs">
          Drag decorations to reposition • Hover & click X to remove
        </div>
      )}
    </div>
  );
};
