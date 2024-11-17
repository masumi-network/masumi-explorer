'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AgentsGrid } from "@/components/dashboard/agents-grid"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function AgentsPage() {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>All AI Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <AgentsGrid limit={null} />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}