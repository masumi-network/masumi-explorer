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
import { fetchFromBlockfrost } from "@/lib/blockfrost";
import { useNetwork } from "@/context/network-context";
import { Card } from "@/components/ui/card";

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
  const { config } = useNetwork();

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add logging to debug the response
      console.log('Fetching assets for policy:', config.policyId);
      const assets = await fetchFromBlockfrost(
        `/assets/policy/${config.policyId}`,
        config
      );
      console.log('Assets response:', assets);

      // Process in batches
      const processedAgents = await Promise.all(
        assets.map(async (asset: any) => {
          const assetDetails = await fetchFromBlockfrost(
            `/assets/${asset.asset}`,
            config
          );
          console.log('Asset details:', assetDetails);

          const txDetails = await fetchFromBlockfrost(
            `/txs/${assetDetails.initial_mint_tx_hash}`,
            config
          );
          
          return {
            asset: asset.asset,
            name: assetDetails.onchain_metadata?.name || 'Unnamed Agent',
            description: assetDetails.onchain_metadata?.description || 'No description available',
            authorName: assetDetails.onchain_metadata?.author?.name || 'Unknown Author',
            registeredAt: new Date(txDetails.block_time * 1000).toLocaleDateString(),
            requests: Math.floor(Math.random() * 20000) + 5000,
            identityVerified: assetDetails.onchain_metadata?.identity_verified || false,
            metadataCorrect: true,
          };
        })
      );

      setAgents(processedAgents);
    } catch (error) {
      console.error('Top Agents Error:', error);
      setError('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (config.blockfrostApiKey) {
      fetchAgents();
    }
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
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-white">Latest AI Agents</h2>
            <p className="text-sm text-[#71717A]">Recently registered agents on the network</p>
          </div>
          <Link href="/agents">
            <Button variant="ghost" size="sm" className="gap-2 text-[#71717A] hover:text-white">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="overflow-auto h-[400px] -mx-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px] pl-6 bg-[#0A0A0A] sticky top-0">AGENT</TableHead>
                <TableHead className="bg-[#0A0A0A] sticky top-0">AUTHOR</TableHead>
                <TableHead className="text-center bg-[#0A0A0A] sticky top-0">REGISTERED</TableHead>
                <TableHead className="text-center bg-[#0A0A0A] sticky top-0">IDENTITY</TableHead>
                <TableHead className="w-[50px] bg-[#0A0A0A] sticky top-0"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow 
                  key={agent.asset} 
                  className="border-zinc-800"
                >
                  <TableCell className="pl-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{agent.name}</p>
                        <Link 
                          href={`https://preprod.cardanoscan.io/token/${agent.asset}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#71717A] hover:text-white"
                        >
                          <ExternalLinkIcon className="w-3 h-3" />
                        </Link>
                      </div>
                      <p className="text-sm text-[#71717A] line-clamp-2">{agent.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#71717A]">{agent.authorName}</TableCell>
                  <TableCell className="text-center text-[#71717A]">{agent.registeredAt}</TableCell>
                  <TableCell className="text-center">
                    {agent.identityVerified ? (
                      <div className="flex items-center justify-center text-emerald-500">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-red-500">
                        <X className="w-4 h-4" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" className="text-[#71717A] hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
} 