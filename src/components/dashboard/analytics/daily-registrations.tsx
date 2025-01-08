import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Add any other UI component imports you need

export default function DailyRegistrations() {
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-white">Daily Registrations</h2>
            <p className="text-sm text-[#71717A]">New agents registered per day</p>
          </div>
        </div>
      </div>
    </Card>
  );
} 