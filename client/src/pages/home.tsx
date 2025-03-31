import { useNetwork } from "@/components/layout";
import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, subMonths, subWeeks, subYears } from "date-fns";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: number;
  transactionId: string;
  timestamp: string;
  transactionType: string;
  network: string;
}

interface Agent {
  id: number;
  name: string;
  createdAt: string;
  metadata: {
    network: string;
  };
}

export default function Home() {
  const { selectedNetwork } = useNetwork();
  const [timeRange, setTimeRange] = useState<string>("week");

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", { network: selectedNetwork }],
  });

  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["/api/agents", { network: selectedNetwork }],
  });

  // Filter data by network
  const networkTransactions = transactions.filter(tx => tx.network === selectedNetwork);
  const networkAgents = agents.filter(agent => agent.metadata?.network === selectedNetwork);

  // Calculate date range based on selected time range
  const endDate = new Date();
  let startDate = new Date();
  
  switch (timeRange) {
    case "week":
      startDate = subWeeks(endDate, 1);
      break;
    case "month":
      startDate = subMonths(endDate, 1);
      break;
    case "year":
      startDate = subYears(endDate, 1);
      break;
    case "all":
      // Set to a date far in the past to include all data
      startDate = new Date(2020, 0, 1);
      break;
    default:
      startDate = subWeeks(endDate, 1);
  }

  // Get all dates in the range for chart
  const dateRange = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dateRange.push(format(currentDate, 'yyyy-MM-dd'));
    currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
  }

  // Process transaction data for the chart
  const transactionsByDay = networkTransactions.reduce((acc: Record<string, number>, transaction) => {
    // Extract just the date portion for grouping
    const dateString = transaction.timestamp.split('T')[0];
    acc[dateString] = (acc[dateString] || 0) + 1;
    return acc;
  }, {});

  // Process agent registration data for the chart
  const registrationsByDay = networkAgents.reduce((acc: Record<string, number>, agent) => {
    // Extract just the date portion for grouping
    const dateString = agent.createdAt.split('T')[0];
    acc[dateString] = (acc[dateString] || 0) + 1;
    return acc;
  }, {});

  // Create chart data arrays with zero values for missing dates
  const transactionChartData = dateRange.map(date => ({
    date,
    transactions: transactionsByDay[date] || 0,
  }));

  const registrationChartData = dateRange.map(date => ({
    date,
    count: registrationsByDay[date] || 0,
  }));

  return (
    <div className="space-y-8">
      {/* Time Range Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-1">
          <Button
            variant={timeRange === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("week")}
            className="rounded-r-none"
          >
            Last Week
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("month")}
            className="rounded-none border-x-0"
          >
            Last Month
          </Button>
          <Button
            variant={timeRange === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("year")}
            className="rounded-none border-r-0"
          >
            Last Year
          </Button>
          <Button
            variant={timeRange === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("all")}
            className="rounded-l-none"
          >
            All Time
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">Total Agents</h3>
          <p className="text-3xl font-bold">{networkAgents.length}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">Total Transactions</h3>
          <p className="text-3xl font-bold">{networkTransactions.length}</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Daily Transactions</h3>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={transactionChartData}>
              <defs>
                <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(date: string) => format(parseISO(date), 'MMM d')}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                labelFormatter={(label) => format(parseISO(label as string), 'MMM d, yyyy')}
                formatter={(value: number) => [value, 'Transactions']}
              />
              <Legend align="right" verticalAlign="top" />
              <Area
                name="Transactions"
                type="monotone"
                dataKey="transactions"
                stroke="#3B82F6"
                strokeWidth={3}
                fill="url(#colorTransactions)"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Agent Registrations</h3>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={registrationChartData}>
              <defs>
                <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(date: string) => format(parseISO(date), 'MMM d')}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: number) => [value, 'Registrations']}
                labelFormatter={(label) => format(parseISO(label as string), 'MMM d, yyyy')}
              />
              <Legend align="right" verticalAlign="top" />
              <Bar
                name="Registrations"
                dataKey="count"
                fill="url(#colorRegistrations)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}