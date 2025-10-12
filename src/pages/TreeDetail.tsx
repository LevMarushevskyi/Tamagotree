import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const TreeDetail = () => {
  const { treeId } = useParams();
  const navigate = useNavigate();

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
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Tree Details</h1>
            <p className="text-muted-foreground">
              Detailed tree view coming soon for tree ID: {treeId}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This page will show comprehensive information about the tree including:
            </p>
            <ul className="text-sm text-muted-foreground mt-4 space-y-2 text-left max-w-md mx-auto">
              <li>• Complete tree statistics and history</li>
              <li>• Photo gallery</li>
              <li>• Task completion timeline</li>
              <li>• Health trends and analytics</li>
              <li>• Care recommendations</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TreeDetail;
