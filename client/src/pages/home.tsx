import { useNetwork } from "@/components/layout";
import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
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

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", { network: selectedNetwork }],
  });

  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["/api/agents", { network: selectedNetwork }],
  });

  // Filter data by network
  const networkTransactions = transactions.filter(tx => tx.network === selectedNetwork);
  const networkAgents = agents.filter(agent => agent.metadata?.network === selectedNetwork);

  // Get the date range for the chart (last 7 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7);

  const dateRange = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dateRange.push(format(currentDate, 'yyyy-MM-dd'));
    currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
  }

  // Process transaction data for the chart, using simpler date extraction
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
          <h3 className="text-lg font-medium mb-4">Daily Transactions</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={transactionChartData}>
              <defs>
                <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(date) => format(parseISO(date), 'MMM d')}
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
              />
              <Area
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
          <h3 className="text-lg font-medium mb-4">Agent Registrations</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={registrationChartData}>
              <defs>
                <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(date) => format(parseISO(date), 'MMM d')}
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
              <Bar
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