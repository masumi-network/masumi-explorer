export interface OnChainMetadata {
    name: string;
    api_url: string;
    description: string;
    company_name: string;
    capability_name: string;
    capability_version: string;
    capability_description: string;
  }
  
  export interface Agent {
    asset: string;
    policy_id: string;
    asset_name: string;
    fingerprint: string;
    quantity: string;
    initial_mint_tx_hash: string;
    mint_or_burn_count: number;
    onchain_metadata: OnChainMetadata | null;
    metadata: any | null;
  }
  
  export interface AssetListItem {
    asset: string;
    quantity: string;
  }