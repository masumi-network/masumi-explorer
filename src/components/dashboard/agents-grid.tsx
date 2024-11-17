"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { AgentCard } from "./agent-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { Agent } from "@/types/agent";

interface AgentsResponse {
  totalAgents: number;
  activeAgents: number;
  agents: Agent[];
}

interface AgentsGridProps {
  limit?: number | null;
  onStatsUpdate?: (total: number, active: number) => void;
}

export function AgentsGrid({ limit, onStatsUpdate }: AgentsGridProps) {
  const [data, setData] = useState<AgentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Safely handle the case where onStatsUpdate might be undefined
  const memoizedOnStatsUpdate = useCallback(
    (total: number, active: number) => {
      // Only call onStatsUpdate if it exists
      if (onStatsUpdate) {
        onStatsUpdate(total, active);
      }
    },
    [onStatsUpdate] // Depend on the onStatsUpdate function
  );

  // Fetch data only once on component mount or when limit changes
  useEffect(() => {
    let mounted = true;

    async function loadAgents() {
      try {
        setLoading(true);
        const url = limit ? `/api/agents?limit=${limit}` : '/api/agents';
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch agents');
        }

        const responseData = await response.json();

        if (mounted) {
          setData(responseData);
          // Only update stats if the data is valid
          if (memoizedOnStatsUpdate && typeof responseData.totalAgents === 'number') {
            memoizedOnStatsUpdate(responseData.totalAgents, responseData.activeAgents);
          }
        }
      } catch (err) {
        console.error("Error loading agents:", err);
        if (mounted) {
          setError("Failed to load AI agents");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAgents();

    // Cleanup function to prevent updates if component unmounts
    return () => {
      mounted = false;
    };
  }, [limit, memoizedOnStatsUpdate]); // Now we depend on memoizedOnStatsUpdate

  const filteredAgents = useMemo(() => {
    if (!data?.agents) return [];

    return data.agents
      .filter((agent) => {
        if (!searchTerm) return true;

        const searchableText = [
          agent.onchain_metadata?.name,
          agent.onchain_metadata?.description,
          agent.asset,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(searchTerm.toLowerCase());
      })
      .filter((agent) => {
        if (statusFilter === "all") return true;
        return statusFilter === "active" ? agent.quantity !== "0" : agent.quantity === "0";
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return (a.onchain_metadata?.name || a.asset).localeCompare(
              b.onchain_metadata?.name || b.asset
            );
          case "oldest":
            return a.asset.localeCompare(b.asset);
          case "newest":
          default:
            return b.asset.localeCompare(a.asset);
        }
      });
  }, [data?.agents, searchTerm, statusFilter, sortBy]);

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredAgents.length} {limit ? 'latest' : ''} agents
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.asset} agent={agent} />
            ))}
          </div>

          {filteredAgents.length === 0 && (
            <div className="text-center py-12 border rounded-lg bg-card">
              <p className="text-muted-foreground">No agents found matching your criteria</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
