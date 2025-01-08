"use client";

import { useBlockfrostCache } from '@/context/blockfrost-cache-context';
import { useNetwork } from '@/context/network-context';
import { useEffect, useState } from 'react';

export function useTopAgents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchCached } = useBlockfrostCache();
  const { config } = useNetwork();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        
        // Get all assets under the policy
        const assets = await fetchCached(
          `/assets/policy/${config.policyId}`
        );

        // Fetch details for each asset
        const agentDetails = await Promise.all(
          assets.map(async (asset: any) => {
            const details = await fetchCached(`/assets/${asset.asset}`);
            const tx = await fetchCached(`/txs/${details.initial_mint_tx_hash}`);
            
            // Extract author name from the object
            const authorData = details.onchain_metadata?.author || {};
            const authorName = typeof authorData === 'object' ? authorData.name : authorData;
            
            return {
              ...details,
              block_time: tx.block_time,
              name: details.onchain_metadata?.name || 'Unknown',
              description: details.onchain_metadata?.description || 'No description',
              authorName: authorName || 'Unknown',
              registeredAt: new Date(tx.block_time * 1000).toLocaleDateString(),
              identityVerified: details.onchain_metadata?.identityVerified || false,
              metadataCorrect: true
            };
          })
        );

        // Sort by block_time before setting state
        const sortedAgents = agentDetails.sort((a, b) => b.block_time - a.block_time);
        setAgents(sortedAgents);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (config.blockfrostApiKey) {
      fetchAgents();
    }
  }, [fetchCached, config]);

  return { agents, isLoading };
} 