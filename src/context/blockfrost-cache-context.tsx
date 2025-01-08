"use client";

import { createContext, useContext, useCallback } from 'react';
import { useNetwork } from './network-context';

interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 60 * 1000; // 60 seconds

export const BlockfrostCacheContext = createContext<{
  fetchCached: (endpoint: string) => Promise<any>;
}>({
  fetchCached: async () => {},
});

export function BlockfrostCacheProvider({ children }: { children: React.ReactNode }) {
  const { config } = useNetwork();

  const fetchCached = useCallback(async (endpoint: string) => {
    const cacheKey = `${config.blockfrostUrl}${endpoint}`;
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(`${config.blockfrostUrl}${endpoint}`, {
        headers: {
          project_id: config.blockfrostApiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Blockfrost API error: ${response.status}`);
      }

      const data = await response.json();
      cache.set(cacheKey, { data, timestamp: now });
      return data;
    } catch (error) {
      console.error('Blockfrost fetch error:', error);
      throw error;
    }
  }, [config]);

  return (
    <BlockfrostCacheContext.Provider value={{ fetchCached }}>
      {children}
    </BlockfrostCacheContext.Provider>
  );
}

export function useBlockfrostCache() {
  return useContext(BlockfrostCacheContext);
} 