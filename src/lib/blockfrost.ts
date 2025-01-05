interface BlockfrostConfig {
  blockfrostApiKey: string;
  blockfrostUrl: string;
  contractAddress: string;
  policyId: string;
}

export async function fetchFromBlockfrost(endpoint: string, config: BlockfrostConfig) {
  const response = await fetch(`${config.blockfrostUrl}${endpoint}`, {
    headers: {
      project_id: config.blockfrostApiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Blockfrost API error: ${response.statusText}`);
  }

  return response.json();
}

// Export the type if needed
export type { BlockfrostConfig }; 