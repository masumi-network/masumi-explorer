import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Link } from "wouter";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { Card } from "@/components/ui/card";

interface Transaction {
  timestamp: string;
  transactionType: string;
}

interface Agent {
  createdAt: string;
}

export default function Home() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  // Process transaction data for the chart
  const transactionsByDay = transactions.reduce((acc: Record<string, number>, transaction) => {
    const day = format(parseISO(transaction.timestamp), 'yyyy-MM-dd');
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  // Process agent registration data for the chart
  const registrationsByDay = agents.reduce((acc: Record<string, number>, agent) => {
    const day = format(parseISO(agent.createdAt), 'yyyy-MM-dd');
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  // Convert to chart data format
  const transactionChartData = Object.entries(transactionsByDay).map(([date, count]) => ({
    date,
    count,
  }));

  const registrationChartData = Object.entries(registrationsByDay).map(([date, count]) => ({
    date,
    count,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="/">
                    <Button variant="ghost" className="justify-start w-full">Dashboard</Button>
                  </Link>
                  <Link href="/agents">
                    <Button variant="ghost" className="justify-start w-full">Agents</Button>
                  </Link>
                  <Link href="/transactions">
                    <Button variant="ghost" className="justify-start w-full">Transactions</Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-semibold">Analytics Dashboard</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Agents</h3>
            <p className="text-3xl">{agents.length}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Transactions</h3>
            <p className="text-3xl">{transactions.length}</p>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Transactions</h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={transactionChartData}>
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Agent Registrations</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={registrationChartData}>
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 Dashboard. All rights reserved.
        </div>
      </footer>
    </div>
  );
}