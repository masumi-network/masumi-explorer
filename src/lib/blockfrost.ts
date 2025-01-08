interface BlockfrostConfig {
  blockfrostApiKey: string;
  blockfrostUrl: string;
  contractAddress: string;
  policyId: string;
}

export async function fetchFromBlockfrost(endpoint: string, config: BlockfrostConfig) {
  if (!config.blockfrostApiKey) {
    throw new Error('Blockfrost API key is not configured');
  }

  try {
    const response = await fetch(`${config.blockfrostUrl}${endpoint}`, {
      headers: {
        project_id: config.blockfrostApiKey,
      },
      // Add caching options
      next: {
        revalidate: 60 // Revalidate every 60 seconds
      }
    });

    if (!response.ok) {
      throw new Error(`Blockfrost API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Blockfrost fetch error:', error);
    throw error;
  }
}

// Export the type if needed
export type { BlockfrostConfig }; 