import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink } from "lucide-react";
import TopAgents from "@/components/dashboard/analytics/top-agents";
import Analytics from "@/components/dashboard/analytics/analytics";
import AveragePositions from "@/components/dashboard/analytics/average-positions";
import LatestPayments from "@/components/dashboard/transactions/latest-payments";
import LatestRegistrations from "@/components/dashboard/transactions/latest-registrations";

export default function Page() {
  return (
    <div>
      <div className="flex flex-col gap-4 mb-7">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-100">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <div className="flex-1">
            <h2 className="font-medium mb-1 text-zinc-100">About Masumi Registry</h2>
            <p className="text-sm text-zinc-400">
              Learn more about the Masumi AI Agent Registry and how to get started
            </p>
          </div>
          <Link href="https://masumi.network" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2 border-zinc-800 text-zinc-400 hover:text-zinc-100">
              Learn More
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-7">
        <AveragePositions className="col-span-12 lg:col-span-4" />
        <Analytics className="col-span-12 lg:col-span-8" />
        <TopAgents className="col-span-12" />
        <LatestPayments className="col-span-12 lg:col-span-6" />
        <LatestRegistrations className="col-span-12 lg:col-span-6" />
      </div>
    </div>
  );
}
