import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
  } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { Avatar, AvatarFallback } from "@/components/ui/avatar";
  import { ExternalLink } from "lucide-react";
  import { type Agent } from "@/types/agent";
  import { MetadataDialog } from "./metadata-dialog"

  // Add this constant
  const CARDANOSCAN_PREPROD_URL = "https://preprod.cardanoscan.io/token";
  
  interface AgentCardProps { 
    agent: Agent;
    className?: string;
  }
  
  export function AgentCard({ agent, className }: AgentCardProps) {
    return (
      <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {agent.onchain_metadata?.name || 'Unnamed Agent'}
            </CardTitle>
            <CardDescription>
              {agent.onchain_metadata?.company_name || 'Unknown Company'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <MetadataDialog agent={agent} />
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-[#f60045] text-white">
                {(agent.onchain_metadata?.name || 'UA').substring(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Capability</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-[#f60045]/10 text-[#f60045]">
                  {agent.onchain_metadata?.capability_name}
                </Badge>
                <Badge variant="outline">
                  v{agent.onchain_metadata?.capability_version}
                </Badge>
              </div>
            </div>
  
            <div>
              <h4 className="text-sm font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {agent.onchain_metadata?.description || 'No description available'}
              </p>
            </div>
  
            {agent.onchain_metadata?.api_url && (
              <div>
                <h4 className="text-sm font-semibold mb-2">API Endpoint</h4>
                <a
                  href={agent.onchain_metadata.api_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#f60045] hover:underline flex items-center gap-1"
                >
                  {agent.onchain_metadata.api_url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
            <div className="text-xs text-muted-foreground">
            Status: {agent.quantity === "0" ? "Inactive" : "Active"}
            </div>
            <a 
            href={`${CARDANOSCAN_PREPROD_URL}/${agent.asset}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#f60045] hover:underline flex items-center gap-1"
            >
            {agent.asset.slice(0, 8)}...{agent.asset.slice(-8)}
            <ExternalLink className="h-3 w-3" />
            </a>
        </CardFooter>
        </Card>
    );
  }