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
import { MoreHorizontal, ExternalLink, MessageSquare, ArrowRight, ExternalLinkIcon, Check, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchFromBlockfrost, BLOCKFROST_CONFIG } from "@/lib/blockfrost";
import { validateMetadata } from "@/lib/metadata-validator";

interface Agent {
  asset: string;
  name: string;
  description: string;
  authorName: string;
  registeredAt: string;
  requests: number;
  identityVerified: boolean;
  metadataCorrect: boolean;
}

export default function TopAgents({ className, ...props }: any) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const data = await fetchFromBlockfrost(`/assets/policy/${BLOCKFROST_CONFIG.policyId}`);
        
        // Get the latest 10 agents
        const latestAgents = data.slice(-10).reverse();
        
        // Transform the data into Agent format
        const transformedAgents = latestAgents.map((asset: any) => {
          const hasStandardMetadata = validateMetadata(asset.onchain_metadata);
          
          return {
            asset: asset.asset,
            name: asset.onchain_metadata?.name || 'Unnamed Agent',
            description: asset.onchain_metadata?.description || 'No description available',
            authorName: hasStandardMetadata 
              ? (asset.onchain_metadata?.author?.name || 'Unknown Author')
              : 'Unknown Author',
            registeredAt: new Date(asset.minted_at || Date.now()).toLocaleDateString(),
            requests: Math.floor(Math.random() * 20000) + 5000,
            identityVerified: asset.onchain_metadata?.identity_verified || false,
            metadataCorrect: hasStandardMetadata,
          };
        });

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
            authorName: "Masumi Labs",
            registeredAt: "2024-01-20",
            requests: 12350,
            identityVerified: false,
            metadataCorrect: false,
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

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
          <h2 className="text-lg font-medium mb-2">Latest AI Agents</h2>
          <p className="text-sm text-muted-foreground">Recently registered agents on the network</p>
        </div>
        <Link href="/agents">
          <Button variant="ghost" size="sm" className="gap-2">
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px] pl-6">AGENT NAME</TableHead>
            <TableHead>AUTHOR</TableHead>
            <TableHead className="text-center">REGISTERED</TableHead>
            <TableHead className="text-center">REQUESTS</TableHead>
            <TableHead className="text-center">IDENTITY</TableHead>
            <TableHead className="text-center">METADATA</TableHead>
            <TableHead className="text-right pr-6">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.asset}>
              <TableCell className="pl-6">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{agent.name}</p>
                    <Link 
                      href={`https://preprod.cardanoscan.io/token/${agent.asset}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <ExternalLinkIcon className="w-3 h-3" />
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                </div>
              </TableCell>
              <TableCell>{agent.authorName}</TableCell>
              <TableCell className="text-center">{agent.registeredAt}</TableCell>
              <TableCell className="text-center">{agent.requests.toLocaleString()}</TableCell>
              <TableCell className="text-center">
                {agent.identityVerified ? (
                  <div className="flex items-center justify-center text-green-500">
                    <Check className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-red-500">
                    <X className="w-4 h-4" />
                  </div>
                )}
              </TableCell>
              <TableCell className="text-center">
                {agent.metadataCorrect ? (
                  <div className="flex items-center justify-center text-green-500">
                    <Check className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-red-500">
                    <X className="w-4 h-4" />
                  </div>
                )}
              </TableCell>
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
} 