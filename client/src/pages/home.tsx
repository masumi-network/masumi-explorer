import { useQuery } from "@tanstack/react-query";
import { format, parseISO, subDays } from "date-fns";
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
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  // Get the last 7 days of data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  }).reverse();

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

  // Ensure we have data points for all days, even if zero
  const transactionChartData = last7Days.map(date => ({
    date,
    count: transactionsByDay[date] || 0,
  }));

  const registrationChartData = last7Days.map(date => ({
    date,
    count: registrationsByDay[date] || 0,
  }));

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">Total Agents</h3>
          <p className="text-3xl font-bold">{agents.length}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">Total Transactions</h3>
          <p className="text-3xl font-bold">{transactions.length}</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Daily Transactions</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={transactionChartData}>
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
                formatter={(value: number) => [value, 'Transactions']}
                labelFormatter={(label) => format(parseISO(label as string), 'MMM d, yyyy')}
              />
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
          <h3 className="text-lg font-medium mb-4">Agent Registrations</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={registrationChartData}>
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
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}