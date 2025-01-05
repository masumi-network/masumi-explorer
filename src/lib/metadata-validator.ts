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

export function validateMetadata(metadata: any): boolean {
  if (!metadata) return false;

  const requiredFields = [
    'name',
    'description',
    'api_url',
    'version',
    'payment_address',
    'author',
    'requests_per_hour',
    'tags',
    'legal'
  ];

  const requiredAuthorFields = ['name', 'contact', 'organization'];
  const requiredLegalFields = ['privacy policy', 'terms'];

  // Check all required top-level fields exist
  const hasAllRequiredFields = requiredFields.every(field => metadata.hasOwnProperty(field));
  if (!hasAllRequiredFields) return false;

  // Check author fields
  const hasAllAuthorFields = requiredAuthorFields.every(field => 
    metadata.author && metadata.author.hasOwnProperty(field)
  );
  if (!hasAllAuthorFields) return false;

  // Check legal fields
  const hasAllLegalFields = requiredLegalFields.every(field => 
    metadata.legal && metadata.legal.hasOwnProperty(field)
  );
  if (!hasAllLegalFields) return false;

  // Check types
  if (
    typeof metadata.name !== 'string' ||
    (!Array.isArray(metadata.description) && typeof metadata.description !== 'string') ||
    typeof metadata.api_url !== 'string' ||
    typeof metadata.example_output !== 'string' ||
    typeof metadata.version !== 'string' ||
    typeof metadata.requests_per_hour !== 'number' ||
    !Array.isArray(metadata.tags) ||
    typeof metadata.image !== 'string'
  ) {
    return false;
  }

  // If description is an array, check all elements are strings
  if (Array.isArray(metadata.description)) {
    if (!metadata.description.every(item => typeof item === 'string')) {
      return false;
    }
  }

  // Check payment_address type and format
  if (Array.isArray(metadata.payment_address)) {
    // If it's an array, it should be the split parts of a single address
    if (!metadata.payment_address.every(part => typeof part === 'string')) {
      return false;
    }
    // Optionally: Add validation that when joined, it forms a valid Cardano address
  } else if (typeof metadata.payment_address !== 'string') {
    return false;
  }

  return true;
}