"use client";

import { NetworkProvider } from "@/context/network-context";
import { BlockfrostCacheProvider } from "@/context/blockfrost-cache-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NetworkProvider>
      <BlockfrostCacheProvider>
        {children}
      </BlockfrostCacheProvider>
    </NetworkProvider>
  );
} 