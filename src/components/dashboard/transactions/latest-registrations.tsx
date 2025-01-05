"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, ReactNode } from "react";
import { fetchFromBlockfrost } from "@/lib/blockfrost";
import { useNetwork } from "@/context/network-context";
import { Card } from "@/components/ui/card";

interface AssetResponse {
  asset: string;
  onchain_metadata?: {
    name?: string;
    description?: string;
    author?: {
      name?: string;
    };
  };
  initial_mint_tx_hash?: string;
}

interface Registration {
  asset: string;
  name: string;
  description: string;
  authorName: string;
  registeredAt: string;
}

export default function LatestRegistrations({ className, ...props }: any): ReactNode {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { config } = useNetwork();

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const assets = await fetchFromBlockfrost(`/assets/policy/${config.policyId}`, config);
        
        // Process assets in parallel
        const assetDetails = await Promise.all(
          assets.map((asset: AssetResponse) => 
            fetchFromBlockfrost(`/assets/${asset.asset}`, config)
          )
        );

        const registrations: Registration[] = assetDetails
          .slice(0, 10)
          .map((details: AssetResponse) => ({
            asset: details.asset,
            name: details.onchain_metadata?.name || 'Unnamed Agent',
            description: details.onchain_metadata?.description || 'No description available',
            authorName: details.onchain_metadata?.author?.name || 'Unknown Author',
            registeredAt: new Date().toLocaleString(),
          }));

        setRegistrations(registrations);
      } catch (error) {
        console.error('Error fetching registrations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [config]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Loading registrations...</p>
      </div>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-white">Latest Registrations</h2>
            <p className="text-sm text-[#71717A]">Recently registered agents</p>
          </div>
          <Link href="/agents">
            <Button variant="ghost" size="sm" className="gap-2 text-[#71717A] hover:text-white">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* ... rest of your JSX */}
      </div>
    </Card>
  );
} 