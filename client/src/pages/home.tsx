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
import { NetworkInfo } from "@/components/network-info";
import { useState } from "react";

interface Transaction {
  timestamp: string;
  transactionType: string;
}

interface Agent {
  createdAt: string;
}

export default function Home() {
  const [selectedNetwork, setSelectedNetwork] = useState("Preprod");

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", { network: selectedNetwork }],
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
    <>
      <NetworkInfo 
        selectedNetwork={selectedNetwork}
        onNetworkChange={setSelectedNetwork}
      />

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
    </>
  );
}