"use client";

import { Card } from "@/components/ui/card";
import { fetchFromBlockfrost } from "@/lib/blockfrost";
import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { CONTRACTS } from "@/config/contracts";
import { useNetwork } from "@/context/network-context";

interface Props {
  className?: string;
}

interface DailyRegistrations {
  date: string;
  registrations: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">
          {`${payload[0].value} registrations`}
        </p>
      </div>
    );
  }
  return null;
};

export default function AgentRegistrations({ className }: Props) {
  const [data, setData] = useState<DailyRegistrations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { config } = useNetwork();

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchFromBlockfrost(
        `/assets/policy/${config.policyId}`,
        config
      );

      const mintTxs = await Promise.all(
        response.map(async (asset: any) => {
          const assetDetails = await fetchFromBlockfrost(
            `/assets/${asset.asset}`,
            config
          );
          const tx = await fetchFromBlockfrost(
            `/txs/${assetDetails.initial_mint_tx_hash}`,
            config
          );
          return {
            timestamp: tx.block_time * 1000
          };
        })
      );

      const now = Date.now();
      const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
      
      const dailyCounts = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now - (i * 24 * 60 * 60 * 1000));
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
        return {
          date: dateStr,
          registrations: 0
        };
      }).reverse();

      mintTxs.forEach(tx => {
        if (tx.timestamp >= sevenDaysAgo) {
          const dayIndex = 6 - Math.floor((now - tx.timestamp) / (24 * 60 * 60 * 1000));
          if (dayIndex >= 0 && dayIndex < 7) {
            dailyCounts[dayIndex].registrations++;
          }
        }
      });

      setData(dailyCounts);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch registration data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (config.blockfrostApiKey) {
      fetchRegistrations();
    }
  }, [config]);

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="space-y-2">
          <h3 className="font-semibold">Daily Registrations</h3>
          <p className="text-xs text-muted-foreground">Loading data...</p>
        </div>
        <div className="h-[200px] mt-4">
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
            <h3 className="font-semibold">Daily Registrations</h3>
            <p className="text-sm text-red-500">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRegistrations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-zinc-100">Daily Registrations</h2>
            <p className="text-sm text-zinc-500">New agent registrations over the last 7 days</p>
          </div>
        </div>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data}
            margin={{ top: 5, right: 10, bottom: 20, left: 35 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#27272a"
              vertical={false} 
            />
            <XAxis
              dataKey="date"
              stroke="#52525b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#52525b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
              domain={[0, 'dataMax + 1']}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="registrations"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
