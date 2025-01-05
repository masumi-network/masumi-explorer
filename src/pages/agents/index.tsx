"use client";

import { useEffect, useState } from "react";
import { fetchFromBlockfrost, BLOCKFROST_CONFIG } from "@/lib/blockfrost";
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

export default function AgentsPage() {
  const { connected, wallet } = useWallet();
  const [walletAssets, setWalletAssets] = useState<string[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [identityFilter, setIdentityFilter] = useState<string>("all");
  const [metadataFilter, setMetadataFilter] = useState<string>("all");
  const [ownershipFilter, setOwnershipFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter and search logic
  const filteredAgents = agents.filter(agent => {
    const searchTermLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchTermLower) ||
      (Array.isArray(agent.description)
        ? agent.description.some(desc => desc.toLowerCase().includes(searchTermLower))
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

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await fetchFromBlockfrost(`/assets/policy/${BLOCKFROST_CONFIG.policyId}`);
        const agentPromises = data.map(async (asset: any) => {
          const details = await fetchFromBlockfrost(`/assets/${asset.asset}`);
          const hasStandardMetadata = validateMetadata(details.onchain_metadata);
          const amount = parseInt(details.quantity || '0');

          return {
            asset: asset.asset,
            name: details.onchain_metadata?.name || 'Unnamed Agent',
            description: details.onchain_metadata?.description || 'No description available',
            authorName: hasStandardMetadata 
              ? (details.onchain_metadata?.author?.name || 'Unknown Author')
              : 'Unknown Author',
            registeredAt: new Date().toLocaleString(),
            identityVerified: details.onchain_metadata?.identity_verified || false,
            metadataCorrect: hasStandardMetadata,
            amount,
            status: amount > 0 ? 'active' : 'retired'
          };
        });

        const agentDetails = await Promise.all(agentPromises);
        setAgents(agentDetails);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  useEffect(() => {
    const fetchWalletAssets = async () => {
      if (connected) {
        try {
          const assets = await wallet.getAssets();
          setWalletAssets(assets.map(asset => asset.unit));
        } catch (error) {
          console.error('Error fetching wallet assets:', error);
          setWalletAssets([]);
        }
      } else {
        setWalletAssets([]);
      }
    };

    fetchWalletAssets();
  }, [connected, wallet]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Loading agents...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-7">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">AI Agents</h1>
            <p className="text-muted-foreground">Browse all registered agents</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Select value={identityFilter} onValueChange={setIdentityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Identity Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Identities</SelectItem>
              <SelectItem value="verified">Verified Only</SelectItem>
              <SelectItem value="unverified">Unverified Only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={metadataFilter} onValueChange={setMetadataFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Metadata Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Metadata</SelectItem>
              <SelectItem value="valid">Valid Only</SelectItem>
              <SelectItem value="invalid">Invalid Only</SelectItem>
            </SelectContent>
          </Select>
          {connected && (
            <Select value={ownershipFilter} onValueChange={setOwnershipFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ownership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="owned">My Agents</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="retired">Retired Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {paginatedAgents.map((agent) => (
          <Card key={agent.asset} className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium">{agent.name}</h2>
              {walletAssets.includes(agent.asset) && (
                <Badge variant="secondary" className="text-xs">
                  Owned by you
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {agent.description}
            </p>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm">
                <span className="text-muted-foreground">By </span>
                {agent.authorName}
              </p>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={agent.status === 'active' ? 'default' : 'secondary'}
                  className={agent.status === 'retired' ? 'opacity-50' : ''}
                >
                  {agent.status === 'active' ? 'Active' : 'Retired'}
                </Badge>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Identity</span>
                  {agent.identityVerified ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Metadata</span>
                  {agent.metadataCorrect ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/agents/${agent.asset}`} className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Details
                </Button>
              </Link>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-1">
                    {agent.metadataCorrect ? (
                      <Link href={`/agents/${agent.asset}/interact`}>
                        <Button className="w-full gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Interact
                        </Button>
                      </Link>
                    ) : (
                      <Button className="w-full gap-2" disabled>
                        <MessageSquare className="w-4 h-4" />
                        Interact
                      </Button>
                    )}
                  </div>
                </TooltipTrigger>
                {!agent.metadataCorrect && (
                  <TooltipContent>
                    <p>Interaction disabled: Metadata standards not met</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
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