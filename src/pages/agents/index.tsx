"use client";

import { useEffect, useState } from "react";
import { fetchFromBlockfrost } from "@/lib/blockfrost";
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  ExternalLink, 
  MessageSquare, 
  Search, 
  Check, 
  X,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react";
import Link from "next/link";
import { validateMetadata } from "@/lib/metadata-validator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWallet } from '@meshsdk/react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNetwork } from "@/context/network-context";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/router';

interface Agent {
  asset: string;
  name: string;
  description: string | string[];
  authorName: string;
  registeredAt: string;
  identityVerified: boolean;
  metadataCorrect: boolean;
  amount: number;
  status: 'active' | 'retired';
}

const ITEMS_PER_PAGE = 9;

function formatDate(dateString: string | number) {
  if (!dateString) return 'Unknown date';
  
  try {
    // Blockfrost returns Unix timestamp in seconds, convert to milliseconds
    const timestamp = typeof dateString === 'string' ? parseInt(dateString) : dateString;
    const date = new Date(timestamp * 1000); // Multiply by 1000 to convert seconds to milliseconds
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown date';
  }
}

export default function AgentsPage() {
  const router = useRouter();
  const { connected, wallet } = useWallet();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [identityFilter, setIdentityFilter] = useState<string>("all");
  const [metadataFilter, setMetadataFilter] = useState<string>("all");
  const [ownershipFilter, setOwnershipFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { config } = useNetwork();

  // Fetch agents with React Query
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents', config.policyId],
    queryFn: async () => {
      const data = await fetchFromBlockfrost(`/assets/policy/${config.policyId}`, config);
      const agentPromises = data.map(async (asset: any) => {
        // Get asset details
        const details = await fetchFromBlockfrost(`/assets/${asset.asset}`, config);
        // Get first transaction (mint) details
        const txDetails = await fetchFromBlockfrost(`/assets/${asset.asset}/transactions?order=asc&count=1`, config);
        const hasStandardMetadata = validateMetadata(details.onchain_metadata);
        const amount = parseInt(details.quantity || '0');

        // Get the block time from the first transaction
        const blockTime = txDetails?.[0]?.block_time;

        return {
          asset: asset.asset,
          name: details.onchain_metadata?.name || 'Unnamed Agent',
          description: details.onchain_metadata?.description || 'No description available',
          authorName: hasStandardMetadata 
            ? (details.onchain_metadata?.author?.name || 'Unknown Author')
            : 'Unknown Author',
          registeredAt: blockTime || '',
          identityVerified: details.onchain_metadata?.identity_verified === true,
          metadataCorrect: hasStandardMetadata,
          amount,
          status: amount > 0 ? 'active' : 'retired'
        };
      });

      const agentDetails = await Promise.all(agentPromises);
      
      // Sort by newest first using block_time
      return agentDetails.sort((a, b) => {
        const timeA = a.registeredAt ? parseInt(String(a.registeredAt)) : 0;
        const timeB = b.registeredAt ? parseInt(String(b.registeredAt)) : 0;
        return timeB - timeA;
      });
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Remove the walletAssets state and use the query data directly
  const { data: walletAssets = [], isLoading: walletAssetsLoading } = useQuery({
    queryKey: ['walletAssets'],
    queryFn: async () => {
      if (!connected || !wallet) return [];
      try {
        return await wallet.getAssets();
      } catch (error) {
        console.error('Error fetching wallet assets:', error);
        return [];
      }
    },
    enabled: connected && !!wallet,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Filter and search logic
  const filteredAgents = (agents || []).filter(agent => {
    const searchTermLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchTermLower) ||
      (Array.isArray(agent.description)
        ? agent.description.some((desc: string) => desc.toLowerCase().includes(searchTermLower))
        : agent.description.toLowerCase().includes(searchTermLower));

    const matchesIdentity = 
      identityFilter === "all" ||
      (identityFilter === "verified" && agent.identityVerified) ||
      (identityFilter === "unverified" && !agent.identityVerified);

    const matchesMetadata = 
      metadataFilter === "all" ||
      (metadataFilter === "valid" && agent.metadataCorrect) ||
      (metadataFilter === "invalid" && !agent.metadataCorrect);

    const matchesOwnership = 
      ownershipFilter === "all" ||
      (ownershipFilter === "owned" && connected && walletAssets.includes(agent.asset));

    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "active" && agent.status === "active") ||
      (statusFilter === "retired" && agent.status === "retired");

    return matchesSearch && matchesIdentity && matchesMetadata && matchesOwnership && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE);
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCardClick = async (assetId: string) => {
    try {
      // Use as instead of pathname/query for cleaner URLs
      await router.push({
        pathname: `/agents/${assetId}`,
        query: { network: router.query.network }
      });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Loading agents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-white">AI Agents</h1>
            <p className="text-sm text-zinc-400">Browse all registered agents</p>
          </div>
          <Link href="/register-agent">
            <Button className="bg-transparent hover:bg-zinc-900 text-white border border-zinc-800 gap-2">
              <Plus className="h-4 w-4" />
              Register New Agent
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search agents..."
                className="pl-10 bg-transparent border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Select value={identityFilter} onValueChange={setIdentityFilter}>
            <SelectTrigger className="w-[180px] bg-transparent border-zinc-800 text-white">
              <SelectValue placeholder="Identity Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All Identities</SelectItem>
              <SelectItem value="verified">Verified Only</SelectItem>
              <SelectItem value="unverified">Unverified Only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={metadataFilter} onValueChange={setMetadataFilter}>
            <SelectTrigger className="w-[180px] bg-transparent border-zinc-800 text-white">
              <SelectValue placeholder="Metadata Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All Metadata</SelectItem>
              <SelectItem value="valid">Valid Only</SelectItem>
              <SelectItem value="invalid">Invalid Only</SelectItem>
            </SelectContent>
          </Select>
          {connected && (
            <Select value={ownershipFilter} onValueChange={setOwnershipFilter}>
              <SelectTrigger className="w-[180px] bg-transparent border-zinc-800 text-white">
                <SelectValue placeholder="Ownership" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="owned">My Agents</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-transparent border-zinc-800 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="retired">Retired Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedAgents.map((agent) => (
          <div 
            key={agent.asset}
            onClick={() => handleCardClick(agent.asset)}
            className="cursor-pointer"
          >
            <Card className="bg-zinc-900/50 border-zinc-800 p-6 hover:bg-zinc-900/70 hover:border-zinc-700 transition-all duration-200 h-[320px] flex flex-col">
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex justify-start">
                  <Badge 
                    variant={agent.status === 'active' ? 'default' : 'secondary'}
                    className={cn(
                      "bg-transparent border px-3 py-1",
                      agent.status === 'active' 
                        ? "border-emerald-800/50 bg-emerald-500/10 text-emerald-500" 
                        : "border-zinc-800 text-zinc-400 opacity-50"
                    )}
                  >
                    {agent.status === 'active' ? 'Active' : 'Retired'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-white">{agent.name}</h2>
                  {walletAssets.includes(agent.asset) && (
                    <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                      Owned by you
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-zinc-400 line-clamp-2 min-h-[40px]">
                  {agent.description}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-sm">
                    <span className="text-zinc-500">By </span>
                    <span className="text-zinc-300">{agent.authorName}</span>
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatDate(agent.registeredAt)}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-zinc-500 mr-1">Identity</span>
                        {agent.identityVerified ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-900 border-zinc-800">
                      <p>Identity {agent.identityVerified ? 'Verified' : 'Unverified'}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-zinc-500 mr-1">Metadata</span>
                        {agent.metadataCorrect ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-900 border-zinc-800">
                      <p>Metadata {agent.metadataCorrect ? 'Valid' : 'Invalid'}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div 
                onClick={(e) => e.stopPropagation()} 
                className="pt-4"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      {agent.metadataCorrect ? (
                        <Link 
                          href={`/agents/${agent.asset}/interact`}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/agents/${agent.asset}/interact`);
                          }}
                        >
                          <Button className="gap-2 bg-transparent border border-zinc-800 text-white hover:bg-zinc-900">
                            <MessageSquare className="w-4 h-4" />
                            Interact
                          </Button>
                        </Link>
                      ) : (
                        <Button className="gap-2 bg-zinc-800/50 text-zinc-500 cursor-not-allowed" disabled>
                          <MessageSquare className="w-4 h-4" />
                          Interact
                        </Button>
                      )}
                    </div>
                  </TooltipTrigger>
                  {!agent.metadataCorrect && (
                    <TooltipContent className="bg-zinc-900 border-zinc-800">
                      <p>Interaction disabled: Metadata standards not met</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent border-zinc-800 text-white hover:bg-zinc-900"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm text-zinc-400">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent border-zinc-800 text-white hover:bg-zinc-900"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 