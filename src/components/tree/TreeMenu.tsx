import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

interface TreeMenuProps {
  treeId: string;
  name: string;
  healthPercentage: number;
  level: number;
}

const TreeMenu = ({ treeId, name, healthPercentage, level }: TreeMenuProps) => {
  const navigate = useNavigate();

  const getHealthColor = (health: number) => {
    if (health >= 70) return "bg-green-500";
    if (health >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleMoreInfo = () => {
    navigate(`/tree/${treeId}`);
  };

  return (
    <div className="min-w-[240px] p-2">
      <h3 className="font-bold text-lg mb-3 text-foreground">{name}</h3>

      {/* Health Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-muted-foreground">Health</span>
          <span className="text-sm font-semibold text-foreground">{healthPercentage}%</span>
        </div>
        <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getHealthColor(healthPercentage)}`}
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
      </div>

      {/* Level */}
      <div className="flex items-center justify-between mb-4 py-2 px-3 bg-primary/10 rounded-lg">
        <span className="text-sm font-medium text-muted-foreground">Level</span>
        <span className="text-lg font-bold text-primary">{level}</span>
      </div>

      {/* More Info Button */}
      <Button
        onClick={handleMoreInfo}
        className="w-full"
        size="sm"
      >
        More Info
      </Button>
    </div>
  );
};

export default TreeMenu;
