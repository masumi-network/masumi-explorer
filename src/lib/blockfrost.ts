const BLOCKFROST_PROJECT_ID = 'preprodhrtK1nyhYpdtYRKQjmUDxpgGqzY7uyEq';

export const BLOCKFROST_CONFIG = {
  url: 'https://cardano-preprod.blockfrost.io/api/v0',
  projectId: BLOCKFROST_PROJECT_ID,
  policyId: "c7842ba56912a2df2f2e1b89f8e11751c6ec2318520f4d312423a272"
} as const;

export async function fetchFromBlockfrost(endpoint: string) {
  const response = await fetch(`${BLOCKFROST_CONFIG.url}${endpoint}`, {
    headers: {
      'project_id': BLOCKFROST_CONFIG.projectId,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
} 