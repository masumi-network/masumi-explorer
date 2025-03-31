import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { format, parseISO } from "date-fns";
import { useNetwork } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarIcon, UserIcon, TagIcon, FileTextIcon, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface Agent {
  id: number;
  name: string;
  description: string;
  creatorName: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export default function AgentDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { selectedNetwork } = useNetwork();
  const agentId = parseInt(id);

  const { data: agent, isLoading, error } = useQuery<Agent>({
    queryKey: [`/api/agents/${agentId}`],
    enabled: !isNaN(agentId),
  });

  if (isLoading) {
    return <AgentDetailsSkeleton />;
  }

  if (error || !agent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/agents")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agents
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <h2 className="text-2xl font-semibold mb-2">Agent Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The agent you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate("/agents")}>
                Return to Agents List
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if the agent matches the selected network
  const agentNetwork = agent.metadata?.network as string;
  const networkMismatch = agentNetwork && agentNetwork !== selectedNetwork;

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={() => navigate("/agents")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Agents
        </Button>
        
        {networkMismatch && (
          <Badge variant="outline" className="ml-auto bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            Network: {agentNetwork}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{agent.name}</CardTitle>
              <CardDescription className="mt-1.5">
                Created by {agent.creatorName}
              </CardDescription>
            </div>
            <Badge variant="outline">{agentNetwork || "Unknown Network"}</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground mr-2">Created:</span>
                <span>{format(parseISO(agent.createdAt), "MMMM d, yyyy 'at' h:mm a")}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground mr-2">Creator:</span>
                <span>{agent.creatorName}</span>
              </div>

              {typeof agent.metadata?.assetId === 'string' && (
                <div className="flex items-center text-sm">
                  <TagIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Asset ID:</span>
                  <span className="font-mono">{agent.metadata.assetId}</span>
                </div>
              )}

              {typeof agent.metadata?.network === 'string' && (
                <div className="flex items-center text-sm">
                  <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Network:</span>
                  <span>{agent.metadata.network}</span>
                </div>
              )}
            </div>

            {agent.metadata && 'capabilities' in agent.metadata && Array.isArray(agent.metadata.capabilities) && (
              <div>
                <h3 className="text-sm font-medium mb-3">Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {(agent.metadata.capabilities as any[]).map((capability, idx) => (
                    <Badge key={idx} variant="secondary" className="capitalize">
                      {typeof capability === 'string' ? capability.replace('_', ' ') : 'Unknown'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />
          
          <div>
            <h3 className="text-sm font-medium mb-3">Description</h3>
            <div className="prose max-w-none dark:prose-invert text-sm">
              <p>{agent.description}</p>
            </div>
          </div>

          {agent.metadata && Object.keys(agent.metadata).length > 0 && (
            <>
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-3">Metadata</h3>
                <pre className="bg-muted/50 p-4 rounded-md text-xs font-mono overflow-auto max-h-[400px]">
                  {JSON.stringify(agent.metadata, null, 2)}
                </pre>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AgentDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Agents
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-8 w-[200px] mb-2" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <Skeleton className="h-5 w-[100px]" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-[100px] mb-3" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-5 w-[80px]" />
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-5 w-[90px]" />
              </div>
            </div>
          </div>

          <Separator />
          
          <div>
            <Skeleton className="h-4 w-[100px] mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}