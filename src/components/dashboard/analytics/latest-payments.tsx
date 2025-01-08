import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LatestPayments() {
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-white">Latest Payments</h2>
            <p className="text-sm text-[#71717A]">Recent transactions on the network</p>
          </div>
        </div>
      </div>
    </Card>
  );
} 