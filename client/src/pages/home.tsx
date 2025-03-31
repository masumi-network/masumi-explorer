import { useNetwork } from "@/components/layout";
import { useState, useRef, useCallback } from 'react';
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, subMonths, subWeeks, startOfDay, endOfDay, isAfter, isBefore, addDays } from "date-fns";
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
  Brush,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [timeRange, setTimeRange] = useState<string>("7d");
  
  // State for chart zoom
  const [txChartLeft, setTxChartLeft] = useState<string | null>(null);
  const [txChartRight, setTxChartRight] = useState<string | null>(null);
  const [txChartRefAreaLeft, setTxChartRefAreaLeft] = useState<string>("");
  const [txChartRefAreaRight, setTxChartRefAreaRight] = useState<string>("");
  
  const [agentChartLeft, setAgentChartLeft] = useState<string | null>(null);
  const [agentChartRight, setAgentChartRight] = useState<string | null>(null);
  const [agentChartRefAreaLeft, setAgentChartRefAreaLeft] = useState<string>("");
  const [agentChartRefAreaRight, setAgentChartRefAreaRight] = useState<string>("");

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
    case "7d":
      startDate = subWeeks(endDate, 1);
      break;
    case "1m":
      startDate = subMonths(endDate, 1);
      break;
    case "3m":
      startDate = subMonths(endDate, 3);
      break;
    case "6m":
      startDate = subMonths(endDate, 6);
      break;
    case "1y":
      startDate = subMonths(endDate, 12);
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

  // Functions for transaction chart zoom
  const handleTxChartMouseDown = (e: any) => {
    if (!e) return;
    setTxChartRefAreaLeft(e.activeLabel);
  };
  
  const handleTxChartMouseMove = (e: any) => {
    if (!e) return;
    if (txChartRefAreaLeft) setTxChartRefAreaRight(e.activeLabel);
  };
  
  const handleTxChartMouseUp = () => {
    if (txChartRefAreaLeft === txChartRefAreaRight || !txChartRefAreaRight) {
      // Reset when no area selected
      setTxChartRefAreaLeft("");
      setTxChartRefAreaRight("");
      return;
    }
    
    // Order left and right
    if (txChartRefAreaLeft > txChartRefAreaRight) {
      setTxChartLeft(txChartRefAreaRight);
      setTxChartRight(txChartRefAreaLeft);
    } else {
      setTxChartLeft(txChartRefAreaLeft);
      setTxChartRight(txChartRefAreaRight);
    }
    
    // Reset for next zoom
    setTxChartRefAreaLeft("");
    setTxChartRefAreaRight("");
  };
  
  const handleTxChartZoomOut = () => {
    setTxChartLeft(null);
    setTxChartRight(null);
  };
  
  // Functions for agent chart zoom
  const handleAgentChartMouseDown = (e: any) => {
    if (!e) return;
    setAgentChartRefAreaLeft(e.activeLabel);
  };
  
  const handleAgentChartMouseMove = (e: any) => {
    if (!e) return;
    if (agentChartRefAreaLeft) setAgentChartRefAreaRight(e.activeLabel);
  };
  
  const handleAgentChartMouseUp = () => {
    if (agentChartRefAreaLeft === agentChartRefAreaRight || !agentChartRefAreaRight) {
      setAgentChartRefAreaLeft("");
      setAgentChartRefAreaRight("");
      return;
    }
    
    if (agentChartRefAreaLeft > agentChartRefAreaRight) {
      setAgentChartLeft(agentChartRefAreaRight);
      setAgentChartRight(agentChartRefAreaLeft);
    } else {
      setAgentChartLeft(agentChartRefAreaLeft);
      setAgentChartRight(agentChartRefAreaRight);
    }
    
    setAgentChartRefAreaLeft("");
    setAgentChartRefAreaRight("");
  };
  
  const handleAgentChartZoomOut = () => {
    setAgentChartLeft(null);
    setAgentChartRight(null);
  };

  return (
    <div className="space-y-8">
      {/* Time Range Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-muted-foreground mr-2">Time Range:</p>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36 bg-card">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="1m">Last 1 month</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last 1 year</SelectItem>
            </SelectContent>
          </Select>
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Daily Transactions</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleTxChartZoomOut}
              disabled={!txChartLeft && !txChartRight}
            >
              Reset Zoom
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            Click and drag to zoom. Double-click to reset zoom.
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart 
              data={transactionChartData}
              onMouseDown={handleTxChartMouseDown}
              onMouseMove={handleTxChartMouseMove}
              onMouseUp={handleTxChartMouseUp}
            >
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
                tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                domain={[txChartLeft || 'dataMin', txChartRight || 'dataMax']}
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
              {txChartRefAreaLeft && txChartRefAreaRight ? (
                <ReferenceArea
                  x1={txChartRefAreaLeft}
                  x2={txChartRefAreaRight}
                  strokeOpacity={0.3}
                  fill="#3B82F6"
                  fillOpacity={0.1}
                />
              ) : null}
              <Brush 
                dataKey="date" 
                height={30}
                stroke="#3B82F6"
                tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                startIndex={Math.max(0, transactionChartData.length - 7)}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Agent Registrations</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAgentChartZoomOut}
              disabled={!agentChartLeft && !agentChartRight}
            >
              Reset Zoom
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            Click and drag to zoom. Double-click to reset zoom.
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart 
              data={registrationChartData}
              onMouseDown={handleAgentChartMouseDown}
              onMouseMove={handleAgentChartMouseMove}
              onMouseUp={handleAgentChartMouseUp}
            >
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
                tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                domain={[agentChartLeft || 'dataMin', agentChartRight || 'dataMax']}
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
              {agentChartRefAreaLeft && agentChartRefAreaRight ? (
                <ReferenceArea
                  x1={agentChartRefAreaLeft}
                  x2={agentChartRefAreaRight}
                  strokeOpacity={0.3}
                  fill="#10B981"
                  fillOpacity={0.1}
                />
              ) : null}
              <Brush 
                dataKey="date" 
                height={30}
                stroke="#10B981"
                tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                startIndex={Math.max(0, registrationChartData.length - 7)}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}