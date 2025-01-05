"use client";

import { Card } from "@/components/ui/card";
import { fetchFromBlockfrost } from "@/lib/blockfrost";
import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { CONTRACTS } from "@/config/contracts";
import { useNetwork } from "@/context/network-context";
import { cn } from "@/lib/utils";
import { StatsBox } from "@/components/dashboard/analytics/stats-box";

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
  const { config } = useNetwork();

  const fetchTransactionHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching transactions for address:', config.contractAddress);
      const transactions = await fetchFromBlockfrost(
        `/addresses/${config.contractAddress}/transactions`,
        config
      );
      console.log('Transaction response:', transactions);

      // Group by day for the last 30 days
      const now = Date.now();
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
      
      // Initialize daily counts
      const dailyCounts = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(now - (i * 24 * 60 * 60 * 1000));
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return {
          date: dateStr,
          transactions: 0,
          volume: 0
        };
      }).reverse();

      // Process each transaction
      const processedTxs = await Promise.all(
        transactions.map(async (tx: any) => {
          const txDetails = await fetchFromBlockfrost(`/txs/${tx.tx_hash}/utxos`, config);
          console.log('Transaction details:', txDetails);
          
          const output = txDetails.outputs.find((out: any) => 
            out.address === config.contractAddress
          );
          
          return {
            timestamp: tx.block_time * 1000,
            amount: output?.amount.find((a: any) => a.unit === 'lovelace')?.quantity || 0
          };
        })
      );

      // Count transactions and sum volume per day
      processedTxs.forEach(tx => {
        if (tx.timestamp >= thirtyDaysAgo) {
          const dayIndex = 29 - Math.floor((now - tx.timestamp) / (24 * 60 * 60 * 1000));
          if (dayIndex >= 0 && dayIndex < 30) {
            dailyCounts[dayIndex].transactions++;
            dailyCounts[dayIndex].volume += parseInt(tx.amount.toString());
          }
        }
      });

      console.log('Processed daily counts:', dailyCounts);
      setData(dailyCounts);

    } catch (error) {
      console.error('Transaction History Error:', error);
      setError('Failed to fetch transaction data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (config.blockfrostApiKey) {
      fetchTransactionHistory();
    }
  }, [config]);

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
    <div>
      <Card className="p-6 mb-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-white">Transaction History</h2>
              <p className="text-sm text-[#71717A]">Transaction volume over the last 30 days</p>
            </div>
            <Button variant="ghost" size="icon" className="text-[#71717A] hover:text-white">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={data}
              margin={{ top: 5, right: 35, bottom: 20, left: 35 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#1F1F1F"
                horizontal={true} 
                vertical={true}
              />
              <XAxis
                dataKey="date"
                stroke="#71717A"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#71717A"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                domain={[0, 'auto']}
                width={35}
                yAxisId="transactions"
              />
              <YAxis
                stroke="#71717A"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}k`}
                domain={[0, 'auto']}
                width={35}
                orientation="right"
                yAxisId="volume"
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: '#1F1F1F', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Line
                type="monotone"
                dataKey="transactions"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                yAxisId="transactions"
                activeDot={{ r: 4, fill: "#22c55e" }}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={false}
                yAxisId="volume"
                activeDot={{ r: 4, fill: "#0ea5e9" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      <div className="grid grid-cols-2 gap-6">
        <StatsBox
          title="Total Revenue"
          subtitle="Lorem ipsum"
          value="$3,345.12"
          change={23.46}
          info="with Node 23"
        />
        <StatsBox
          title="Total Revenue"
          subtitle="Lorem ipsum"
          value="$1,345.12"
          change={-2.65}
          info="with Node 23"
        />
      </div>
    </div>
  );
}
