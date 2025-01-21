"use client";

import TopAgents from "./analytics/top-agents";
import Analytics from "./analytics/analytics";
import AveragePositions from "./analytics/average-positions";
import LatestPayments from "./transactions/latest-payments";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { StatsBox } from "./analytics/stats-box";

export function DashboardContent() {
  const { stats, isLoading } = useDashboardStats();

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-7">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-semibold text-zinc-100">Dashboard</h1>
        </div>
        <p className="text-zinc-500 text-lg max-w-3xl">
          Track and analyze AI agent activities, transactions, and interactions within the Masumi Protocol ecosystem.
        </p>
        <div className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <div className="flex-1">
            <h2 className="font-medium mb-1 text-zinc-100">About Masumi Registry</h2>
            <p className="text-sm text-zinc-400">
              Learn more about the Masumi AI Agent Registry and how to get started
            </p>
          </div>
          <Link 
            href="https://github.com/orgs/masumi-network/repositories" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-90"
          >
            <Button variant="outline" className="gap-2 border-zinc-800 text-zinc-400 hover:text-zinc-100">
              Learn More
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 lg:col-span-3">
          <StatsBox
            title="Total Agents Registered"
            subtitle="All Time"
            value={stats.totalAgents.toString()}
          />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <StatsBox
            title="Agents Registered"
            subtitle="This Month"
            value={stats.monthlyAgents.current.toString()}
            change={stats.monthlyAgents.change}
          />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <StatsBox
            title="Total Transactions"
            subtitle="All Time"
            value={stats.totalTransactions.count.toString()}
          />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <StatsBox
            title="Monthly Transactions"
            subtitle="This Month"
            value={stats.monthlyTransactions.count.toString()}
            change={stats.monthlyTransactions.change}
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 lg:col-span-6">
          <AveragePositions />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <Analytics />
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-6">
          <TopAgents />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <LatestPayments />
        </div>
      </div>
    </div>
  );
} 