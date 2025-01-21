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
  projectId: process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID ? '[EXISTS]' : '[MISSING]',
});

const networkConfigs: Record<Network, NetworkConfig> = {
  mainnet: {
    policyId: "",
    contractAddress: "",
    blockfrostApiKey: process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID || '',
    blockfrostUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
  },
  preprod: {
    policyId: "2beb0dafc9c0bbfc7385f79972eadd2ea4f027c4cdb732b9a3908ad4",
    contractAddress: "addr_test1wrm4l7k9qgw9878ymvw223u45fje48tnhqsxk2tewe47z7se03mca",
    blockfrostApiKey: process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID || '',
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