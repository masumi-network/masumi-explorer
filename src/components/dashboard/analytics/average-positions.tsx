"use client";

import { Card } from "@/components/ui/card";
import { fetchFromBlockfrost } from "@/lib/blockfrost";
import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { CONTRACTS } from "@/config/contracts";

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

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const assets = await fetchFromBlockfrost(`/assets/policy/${CONTRACTS.POLICY_ID}`);

      const mintTxs = await Promise.all(
        assets.map(async (asset: any) => {
          const assetDetails = await fetchFromBlockfrost(`/assets/${asset.asset}`);
          const tx = await fetchFromBlockfrost(`/txs/${assetDetails.initial_mint_tx_hash}`);
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
      console.error('Error fetching registrations:', error);
      setError('Failed to fetch registration data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

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
    <Card className={`p-6 ${className}`}>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Daily Registrations</h3>
            <p className="text-xs text-muted-foreground">New agent registrations over the last 7 days</p>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchRegistrations}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data}
            margin={{ top: 5, right: 10, bottom: 20, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
              domain={[0, 'dataMax + 1']}
              width={25}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="registrations"
              fill="currentColor"
              radius={[4, 4, 0, 0]}
              className="fill-primary"
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
