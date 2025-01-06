"use client";

import { useState, useEffect } from 'react';
import { useBlockfrostCache } from '@/context/blockfrost-cache-context';
import { useNetwork } from '@/context/network-context';

export function useTopAgents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchCached } = useBlockfrostCache();
  const { config } = useNetwork();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const assets = await fetchCached(`/assets/policy/${config.policyId}`);
        const agentDetails = await Promise.all(
          assets.map(async (asset: any) => {
            const details = await fetchCached(`/assets/${asset.asset}`);
            return {
              asset: asset.asset,
              name: details.onchain_metadata?.name || 'Unnamed Agent',
              description: details.onchain_metadata?.description || 'No description available',
              authorName: details.onchain_metadata?.author?.name || 'Unknown Author',
              registeredAt: new Date().toLocaleString(),
              requests: Math.floor(Math.random() * 20000) + 5000,
              identityVerified: false,
              metadataCorrect: true,
            };
          })
        );
        setAgents(agentDetails);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, [fetchCached, config.policyId]);

  return { agents, isLoading };
} 