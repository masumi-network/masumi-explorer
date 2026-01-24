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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TimeRange = "week" | "month" | "year" | "all";

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

function getDateRangeData(
  timeRange: TimeRange, 
  data: Record<string, number>
): Array<{ date: string, value: number }> {
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
  }

  // Get all dates in the range for chart
  const dateRange = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dateRange.push(format(currentDate, 'yyyy-MM-dd'));
    currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
  }

  // Create chart data array with zero values for missing dates
  return dateRange.map(date => ({
    date,
    value: data[date] || 0,
  }));
}

export default function Home() {
  const { selectedNetwork } = useNetwork();
  const [txTimeRange, setTxTimeRange] = useState<TimeRange>("week");
  const [agentTimeRange, setAgentTimeRange] = useState<TimeRange>("week");

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", { network: selectedNetwork }],
  });

  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["/api/agents", { network: selectedNetwork }],
  });

  // Filter data by network
  const networkTransactions = transactions.filter(tx => tx.network === selectedNetwork);
  const networkAgents = agents.filter(agent => agent.metadata?.network === selectedNetwork);

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

  // Get filtered data based on each chart's time range
  const transactionChartData = getDateRangeData(txTimeRange, transactionsByDay);
  const registrationChartData = getDateRangeData(agentTimeRange, registrationsByDay);

  // Time range selector component using Select, similar to network selection
  const TimeRangeSelector = ({ 
    selectedRange, 
    onChange 
  }: { 
    selectedRange: TimeRange, 
    onChange: (range: TimeRange) => void 
  }) => {
    const timeRangeLabels: Record<TimeRange, string> = {
      week: "Last Week",
      month: "Last Month",
      year: "Last Year", 
      all: "All Time"
    };

    return (
      <Select value={selectedRange} onValueChange={onChange}>
        <SelectTrigger className="w-[130px] h-9 bg-background/50 border-border/40">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">{timeRangeLabels.week}</SelectItem>
          <SelectItem value="month">{timeRangeLabels.month}</SelectItem>
          <SelectItem value="year">{timeRangeLabels.year}</SelectItem>
          <SelectItem value="all">{timeRangeLabels.all}</SelectItem>
        </SelectContent>
      </Select>
    );
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      
      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2 pt-6 px-6">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Agents</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-6 pb-6">
            <p className="text-3xl font-bold">{networkAgents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-6 px-6">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-6 pb-6">
            <p className="text-3xl font-bold">{networkTransactions.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-1 pt-6 px-6 flex flex-row justify-between items-center">
            <CardTitle>Daily Transactions</CardTitle>
            <TimeRangeSelector selectedRange={txTimeRange} onChange={setTxTimeRange} />
          </CardHeader>
          <CardContent className="px-6 pt-0 pb-6">
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
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#colorTransactions)"
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-6 px-6 flex flex-row justify-between items-center">
            <CardTitle>Agent Registrations</CardTitle>
            <TimeRangeSelector selectedRange={agentTimeRange} onChange={setAgentTimeRange} />
          </CardHeader>
          <CardContent className="px-6 pt-0 pb-6">
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
                  dataKey="value"
                  fill="url(#colorRegistrations)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}