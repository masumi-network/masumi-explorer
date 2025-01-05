"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ExternalLink, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchFromBlockfrost } from "@/lib/blockfrost";
import { useNetwork } from "@/context/network-context";

interface Agent {
  asset: string;
  name: string;
  description: string;
  accuracy: number;
  requests: number;
  chart?: any; // For visualization
}

const TopAgents = ({ className, ...props }: any) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { config } = useNetwork();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const data = await fetchFromBlockfrost(`/assets/policy/${config.policyId}`, config);
        
        // Transform the data into Agent format
        const transformedAgents = data
          .slice(0, 10) // Get last 10 agents
          .map((asset: any) => ({
            asset: asset.asset,
            name: asset.onchain_metadata?.name || 'Unnamed Agent',
            description: asset.onchain_metadata?.description || 'No description available',
            accuracy: Math.floor(Math.random() * 20) + 80, // Placeholder: 80-100%
            requests: Math.floor(Math.random() * 20000) + 5000, // Placeholder: 5k-25k
          }));

        setAgents(transformedAgents);
      } catch (err) {
        console.error('Error fetching agents:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch agents');
        // Fall back to placeholder data
        setAgents([
          {
            asset: "asset1...",
            name: "BetterAI Assistant",
            description: "Advanced AI Assistant for general tasks",
            accuracy: 92,
            requests: 12350,
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [config]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Loading agents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Error loading agents: {error}
      </div>
    );
  }

  return (
    <div
      className={cn("shadow border border-border rounded-2xl", className)}
      {...props}
    >
      <div className="p-6 pb-2 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-medium mb-2">Top AI Agents</h2>
          <p className="text-sm text-muted-foreground">Most used agents on the network</p>
        </div>
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px] pl-6">AGENT NAME</TableHead>
            <TableHead className="text-center">ACCURACY</TableHead>
            <TableHead className="text-center">REQUESTS</TableHead>
            <TableHead className="text-right pr-6">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.asset}>
              <TableCell className="pl-6">
                <div>
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <span className={cn(
                  "text-sm font-medium",
                  agent.accuracy > 90 ? "text-green-500" : "text-yellow-500"
                )}>
                  {agent.accuracy}%
                </span>
              </TableCell>
              <TableCell className="text-center">{agent.requests.toLocaleString()}</TableCell>
              <TableCell className="text-right pr-6">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/agents/${agent.asset}`}>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                  </Link>
                  <Link href={`/agents/${agent.asset}/interact`}>
                    <Button variant="default" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Interact
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TopAgents;
