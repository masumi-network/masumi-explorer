"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

type Network = 'mainnet' | 'preprod';

interface NetworkConfig {
  policyId: string;
  contractAddress: string;
  blockfrostApiKey: string;
  blockfrostUrl: string;
}

// Add logging to check environment variables
console.log('Environment Variables:', {
  preprodKey: process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY_PREPROD ? '[EXISTS]' : '[MISSING]',
  mainnetKey: process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY_MAINNET ? '[EXISTS]' : '[MISSING]'
});

const networkConfigs: Record<Network, NetworkConfig> = {
  mainnet: {
    policyId: "",
    contractAddress: "",
    blockfrostApiKey: process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY_MAINNET || '',
    blockfrostUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
  },
  preprod: {
    policyId: "c7842ba56912a2df2f2e1b89f8e11751c6ec2318520f4d312423a272",
    contractAddress: "addr_test1wr3hvt2hw89l6ay85lr0f2nr80tckrnpjr808dxhq39xkssvw7mx8",
    blockfrostApiKey: process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY_PREPROD || '',
    blockfrostUrl: "https://cardano-preprod.blockfrost.io/api/v0",
  },
};

interface NetworkContextType {
  network: Network;
  setNetwork: (network: Network) => void;
  config: NetworkConfig;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetwork] = useState<Network>('preprod');

  // Add logging to check the current config
  console.log('Current Network Config:', {
    network,
    config: {
      ...networkConfigs[network],
      blockfrostApiKey: networkConfigs[network].blockfrostApiKey ? '[REDACTED]' : '[MISSING]'
    }
  });

  const value = {
    network,
    setNetwork,
    config: networkConfigs[network],
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
} 