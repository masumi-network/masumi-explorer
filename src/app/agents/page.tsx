"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AgentsGrid } from "@/components/dashboard/agents-grid"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  CircuitBoard,
  Activity,
  ArrowRight
} from "lucide-react"
import { useState } from "react";

export default function Home() {
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0
  });

  // Function to update stats that we'll pass to AgentsGrid
  const updateStats = (total: number, active: number) => {
    setStats({
      totalAgents: total,
      activeAgents: active
    });
  };

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <CircuitBoard className="h-8 w-8 text-[#f60045]" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
                <h3 className="text-2xl font-bold">{stats.totalAgents}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Activity className="h-8 w-8 text-[#f60045]" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Agents</p>
                <h3 className="text-2xl font-bold">{stats.activeAgents}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Latest Registered AI Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <AgentsGrid 
            limit={20} 
            onStatsUpdate={updateStats}  // Add this prop
          />
          <div className="mt-6 text-center">
            <Link href="/agents">
              <Button>
                Explore more Agents
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}