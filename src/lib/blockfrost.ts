const BLOCKFROST_PROJECT_ID = 'preprodhrtK1nyhYpdtYRKQjmUDxpgGqzY7uyEq';

export const BLOCKFROST_CONFIG = {
  url: 'https://cardano-preprod.blockfrost.io/api/v0',
  projectId: BLOCKFROST_PROJECT_ID,
  policyId: "c7842ba56912a2df2f2e1b89f8e11751c6ec2318520f4d312423a272"
} as const;

export async function fetchFromBlockfrost(endpoint: string, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`${BLOCKFROST_CONFIG.url}${endpoint}`, {
        headers: {
          'project_id': BLOCKFROST_CONFIG.projectId,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        // If we hit rate limit (429), wait longer
        if (response.status === 429) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
          continue;
        }
        throw new Error(`Blockfrost API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error; // If last retry, throw error
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
} 