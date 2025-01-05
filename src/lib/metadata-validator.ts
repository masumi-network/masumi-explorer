interface AuthorMetadata {
  name: string;
  contact: string;
  organization: string;
}

interface LegalMetadata {
  "privacy policy": string;
  terms: string;
  other?: string;
}

export interface AgentMetadata {
  name: string;
  description: string | string[];
  api_url: string;
  example_output: string;
  version: string;
  author: AuthorMetadata;
  requests_per_hour: number;
  tags: string[];
  legal: LegalMetadata;
  image: string;
  payment_address: string | string[];
}

interface Metadata {
  name: string;
  description: string | string[];
  image: string;
  // Add other metadata fields as needed
}

export function validateMetadata(metadata: Metadata): boolean {
  // Basic validation
  if (!metadata || typeof metadata !== 'object') {
    return false;
  }

  // Check required fields exist
  if (!metadata.name || !metadata.description || !metadata.image) {
    return false;
  }

  // Validate name
  if (typeof metadata.name !== 'string') {
    return false;
  }

  // Validate description
  if (typeof metadata.description !== 'string' && !Array.isArray(metadata.description)) {
    return false;
  }

  // If description is an array, check all elements are strings
  if (Array.isArray(metadata.description)) {
    if (!metadata.description.every((item: string) => typeof item === 'string')) {
      return false;
    }
  }

  // Validate image
  if (typeof metadata.image !== 'string') {
    return false;
  }

  return true;
}