"use client";

import { createContext, useContext, useCallback, useState } from 'react';
import { fetchFromBlockfrost } from '@/lib/blockfrost';
import { useNetwork } from './network-context';

interface CacheEntry {
  data: any;
  timestamp: number;
}

interface BlockfrostCacheContextType {
  fetchCached: (endpoint: string, staleTime?: number) => Promise<any>;
  clearCache: () => void;
}

const BlockfrostCacheContext = createContext<BlockfrostCacheContextType | null>(null);

const cache = new Map<string, CacheEntry>();

export function BlockfrostCacheProvider({ children }: { children: React.ReactNode }) {
  const { config } = useNetwork();
  const [, setUpdateTrigger] = useState(0);

  const fetchCached = useCallback(async (endpoint: string, staleTime = 1000 * 60 * 5) => {
    const cacheKey = `${endpoint}-${config.policyId}`;
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < staleTime) {
      return cached.data;
    }

    const data = await fetchFromBlockfrost(endpoint, config);
    cache.set(cacheKey, { data, timestamp: now });
    setUpdateTrigger(prev => prev + 1); // Trigger re-render
    return data;
  }, [config]);

  const clearCache = useCallback(() => {
    cache.clear();
    setUpdateTrigger(prev => prev + 1);
  }, []);

  return (
    <BlockfrostCacheContext.Provider value={{ fetchCached, clearCache }}>
      {children}
    </BlockfrostCacheContext.Provider>
  );
}

export function useBlockfrostCache() {
  const context = useContext(BlockfrostCacheContext);
  if (!context) {
    throw new Error('useBlockfrostCache must be used within a BlockfrostCacheProvider');
  }
  return context;
} 