"use client";

import { useBlockfrost } from './use-blockfrost';

interface AssetDetails {
  asset: string;
  policy_id: string;
  asset_name: string;
  initial_mint_tx_hash: string;
  quantity: string;
  onchain_metadata: {
    name: string;
    description: string;
    image: string;
    // add other metadata fields as needed
  };
}

interface TransactionDetails {
  hash: string;
  block: string;
  block_height: number;
  block_time: number;
  // add other transaction fields as needed
}

export function useAgentDetails(assetId: string) {
  const { data: asset, isLoading: assetLoading } = useBlockfrost<AssetDetails>(
    `/assets/${assetId}`,
    {
      staleTime: 1000 * 60 * 15, // 15 minutes
    }
  );

  const { data: txDetails, isLoading: txLoading } = useBlockfrost<TransactionDetails>(
    `/txs/${asset?.initial_mint_tx_hash}`,
    {
      enabled: !!asset?.initial_mint_tx_hash,
      staleTime: 1000 * 60 * 60, // 1 hour
    }
  );

  return {
    asset,
    txDetails,
    isLoading: assetLoading || txLoading
  };
} 