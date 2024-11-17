import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function DashboardHeader() {
  return (
    <Card className={cn("p-6 mb-6 flex items-center justify-between")}>
      <div>
        <h1 className="text-2xl font-bold text-[#f60045]">Masumi AI Agents</h1>
        <p className="text-sm text-muted-foreground">
          Manage and monitor your AI agents
        </p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Network:</span>
          <span className="text-sm text-muted-foreground">Preprod</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Total Agents:</span>
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    </Card>
  );
}