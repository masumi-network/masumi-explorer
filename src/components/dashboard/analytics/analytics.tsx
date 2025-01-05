"use client";

import { Card } from "@/components/ui/card";
import { fetchFromBlockfrost } from "@/lib/blockfrost";
import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { CONTRACTS } from "@/config/contracts";

interface Props {
  className?: string;
}

interface DailyTransactions {
  date: string;
  transactions: number;
  volume: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">
          {`${payload[0].value} transactions`}
        </p>
        <p className="text-sm text-muted-foreground">
          {`${(payload[1].value / 1000000).toFixed(2)} ₳ volume`}
        </p>
      </div>
    );
  }
  return null;
};

export default function Analytics({ className }: Props) {
  const [data, setData] = useState<DailyTransactions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactionHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get transactions from the payment script address
      const scriptUtxos = await fetchFromBlockfrost(
        `/addresses/${CONTRACTS.PAYMENT_SCRIPT}/utxos`
      );

      const txs = await Promise.all(
        scriptUtxos.map(async (utxo: any) => {
          const tx = await fetchFromBlockfrost(`/txs/${utxo.tx_hash}`);
          return {
            timestamp: tx.block_time * 1000,
            amount: utxo.amount.find((a: any) => a.unit === 'lovelace')?.quantity || 0
          };
        })
      );

      // Group by day for the last 30 days
      const now = Date.now();
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
      
      const dailyCounts = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(now - (i * 24 * 60 * 60 * 1000));
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return {
          date: dateStr,
          transactions: 0,
          volume: 0
        };
      }).reverse();

      // Count transactions and sum volume per day
      txs.forEach(tx => {
        if (tx.timestamp >= thirtyDaysAgo) {
          const dayIndex = 29 - Math.floor((now - tx.timestamp) / (24 * 60 * 60 * 1000));
          if (dayIndex >= 0 && dayIndex < 30) {
            dailyCounts[dayIndex].transactions++;
            dailyCounts[dayIndex].volume += parseInt(tx.amount);
          }
        }
      });

      setData(dailyCounts);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to fetch transaction data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="space-y-2">
          <h3 className="font-semibold">Transaction History</h3>
          <p className="text-xs text-muted-foreground">Loading data...</p>
        </div>
        <div className="aspect-[2/1] w-full mt-4">
          <Skeleton className="w-full h-full" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Transaction History</h3>
            <p className="text-sm text-red-500">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchTransactionHistory}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Transaction History</h3>
            <p className="text-xs text-muted-foreground">Transaction volume over the last 30 days</p>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchTransactionHistory}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data}
            margin={{ top: 5, right: 35, bottom: 20, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
              interval={3}
              tickMargin={8}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
              domain={[0, 'auto']}
              width={20}
              yAxisId="transactions"
              tickCount={5}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}₳`}
              domain={[0, 'auto']}
              width={35}
              orientation="right"
              yAxisId="volume"
              tickCount={5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="transactions"
              stroke="hsl(var(--primary))"
              strokeWidth={1.5}
              dot={false}
              yAxisId="transactions"
            />
            <Line
              type="monotone"
              dataKey="volume"
              stroke="hsl(var(--primary)/.5)"
              strokeWidth={1.5}
              dot={false}
              yAxisId="volume"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
