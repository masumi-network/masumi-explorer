"use client";

import { useEffect, useState } from "react";
import { fetchFromBlockfrost, BLOCKFROST_CONFIG } from "@/lib/blockfrost";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { validateMetadata } from "@/lib/metadata-validator";
import { Badge } from "@/components/ui/badge";

interface Registration {
  asset: string;
  name: string;
  author: string;
  timestamp: number;
  metadataCorrect: boolean;
  type: 'registration' | 'deregistration';
  txHash: string;
}

interface BlockfrostAsset {
  asset: string;
  onchain_metadata?: {
    name?: string;
    author?: {
      name?: string;
    };
  };
}

interface BlockfrostTx {
  tx_hash: string;
  block_time: number;
}

export default function LatestRegistrations({ className }: { className?: string }) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        let allAssets: any[] = [];
        let page = 1;
        let hasMore = true;

        // Fetch all assets with pagination
        while (hasMore) {
          const assets = await fetchFromBlockfrost(
            `/assets/policy/${BLOCKFROST_CONFIG.policyId}?page=${page}&count=100`
          );
          
          if (assets.length === 0) {
            hasMore = false;
          } else {
            allAssets = [...allAssets, ...assets];
            page++;
          }
        }

        console.log(`Found ${allAssets.length} total assets`);

        // Get all transactions for each asset
        const allTransactions = await Promise.all(
          allAssets.map(async (asset) => {
            try {
              const assetDetails = await fetchFromBlockfrost(`/assets/${asset.asset}`);
              const history = await fetchFromBlockfrost(`/assets/${asset.asset}/history`);
              
              // Get transaction details for each history entry
              const transactionPromises = history.map(async (entry: any) => {
                const txDetails = await fetchFromBlockfrost(`/txs/${entry.tx_hash}`);
                console.log('Transaction details:', txDetails);
                
                const hasStandardMetadata = validateMetadata(assetDetails.onchain_metadata);

                return {
                  asset: asset.asset,
                  name: assetDetails.onchain_metadata?.name || 'Unnamed Agent',
                  author: hasStandardMetadata 
                    ? (assetDetails.onchain_metadata?.author?.name || 'Unknown Author')
                    : 'Unknown Author',
                  timestamp: txDetails.block_time, // Use block_time from transaction details
                  metadataCorrect: hasStandardMetadata,
                  type: entry.action === 'minted' ? 'registration' : 'deregistration',
                  txHash: entry.tx_hash
                };
              });

              return await Promise.all(transactionPromises);
            } catch (error) {
              console.error(`Error fetching history for asset ${asset.asset}:`, error);
              return [];
            }
          })
        );

        // Flatten and sort
        const allTransactionsSorted = allTransactions
          .flat()
          .sort((a, b) => {
            // Sort by timestamp (newest first)
            const timeCompare = b.timestamp - a.timestamp;
            if (timeCompare !== 0) return timeCompare;

            // If timestamps are equal, show registrations before deregistrations
            if (a.type === 'registration' && b.type === 'deregistration') return -1;
            if (a.type === 'deregistration' && b.type === 'registration') return 1;
            return 0;
          })
          .slice(0, 10);

        // Add detailed logging
        console.log('All transactions before sorting:', allTransactions.flat().map(tx => ({
          name: tx.name,
          type: tx.type,
          timestamp: tx.timestamp,
          date: new Date(tx.timestamp * 1000).toLocaleString(),
          asset: tx.asset,
          txHash: tx.txHash
        })));

        console.log('Final sorted transactions:', allTransactionsSorted.map(tx => ({
          name: tx.name,
          type: tx.type,
          timestamp: tx.timestamp,
          date: new Date(tx.timestamp * 1000).toLocaleString(),
          asset: tx.asset,
          txHash: tx.txHash
        })));

        setRegistrations(allTransactionsSorted);
      } catch (error) {
        console.error('Error fetching registrations:', error);
      }
    };

    fetchRegistrations();
  }, []);

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium">Latest Agent Activity</h3>
            <p className="text-sm text-muted-foreground">Recent registrations and deregistrations</p>
          </div>
          <Link href="/agents">
            <Button variant="ghost" size="sm" className="gap-2">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {registrations.map((reg, index) => (
            <div key={`${reg.asset}-${reg.type}-${index}`} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Badge 
                  variant={reg.type === 'registration' ? 'default' : 'destructive'}
                  className="w-24 justify-center"
                >
                  {reg.type === 'registration' ? 'Registered' : 'Deregistered'}
                </Badge>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{reg.name}</p>
                    <Link 
                      href={`https://preprod.cardanoscan.io/token/${reg.asset}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground">By {reg.author}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground whitespace-nowrap">
                {new Date(reg.timestamp * 1000).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
} 