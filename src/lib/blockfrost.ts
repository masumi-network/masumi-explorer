interface BlockfrostConfig {
  blockfrostUrl: string;
  blockfrostApiKey: string;
  policyId: string;
  contractAddress: string;
}

export async function fetchFromBlockfrost(endpoint: string, config: BlockfrostConfig) {
  console.log('Blockfrost Config:', {
    url: config?.blockfrostUrl,
    apiKey: config?.blockfrostApiKey ? '[REDACTED]' : 'missing',
    policyId: config?.policyId,
    endpoint
  });

  if (!config || !config.blockfrostUrl || !config.blockfrostApiKey) {
    throw new Error('Invalid Blockfrost configuration');
  }

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