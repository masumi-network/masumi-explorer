import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

const api = new BlockFrostAPI({
  projectId: process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID || 'preprodD813pPbW5SjD3oa6HbNVcy72eDJTsxgF',
  network: 'preprod'
});

const POLICY_ID = '97caadc87d40ed22ccd07db3f062c1d3b534a7a9c7534e9aa8857121';

export async function getAgents() {
  try {
    // Get all assets under the policy ID
    const assets = await api.assetsPolicyById(POLICY_ID);
    console.log('Found assets:', assets);

    // Get detailed information for each asset
    const agentsDetails = await Promise.all(
      assets.map(async (asset) => {
        try {
          const details = await api.assetsById(asset.asset);
          console.log('Asset details:', details);
          return {
            ...details,
            assetId: asset.asset,
            quantity: asset.quantity,
          };
        } catch (error) {
          console.error(`Error fetching details for asset ${asset.asset}:`, error);
          return null;
        }
      })
    );

    return agentsDetails.filter(agent => agent !== null);
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
}