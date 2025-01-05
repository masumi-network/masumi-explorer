import { AgentMetadata } from './metadata-validator';

interface SwaggerDefinition {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths: {
    [key: string]: {
      post: {
        summary: string;
        requestBody: {
          required: boolean;
          content: {
            'application/json': {
              schema: {
                type: string;
                properties: {
                  [key: string]: {
                    type: string;
                    description: string;
                  };
                };
              };
            };
          };
        };
        responses: {
          '200': {
            description: string;
            content: {
              'application/json': {
                schema: {
                  type: string;
                  properties: {
                    [key: string]: {
                      type: string;
                      description: string;
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
  };
}

export function generateSwaggerDoc(metadata: AgentMetadata): SwaggerDefinition {
  return {
    openapi: '3.0.0',
    info: {
      title: metadata.name,
      description: Array.isArray(metadata.description) 
        ? metadata.description.join('\n') 
        : metadata.description,
      version: metadata.version
    },
    servers: [
      {
        url: metadata.api_url,
        description: 'Agent API endpoint'
      }
    ],
    paths: {
      '/generate': {
        post: {
          summary: 'Generate content using the agent',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    prompt: {
                      type: 'string',
                      description: 'The input prompt for the agent'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      result: {
                        type: 'string',
                        description: 'Generated output'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
} 