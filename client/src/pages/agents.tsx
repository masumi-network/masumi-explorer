import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface Agent {
  id: number;
  name: string;
  description: string;
  creatorName: string;
  metadata: Record<string, unknown>;
}

export default function Agents() {
  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AI Agents</h1>

      {/* Agents Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <CardTitle>{agent.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">{agent.description}</p>
              <p className="text-sm">Created by: {agent.creatorName}</p>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Capabilities:</h4>
                <div className="flex flex-wrap gap-2">
                  {(agent.metadata.capabilities as string[])?.map((capability, index) => (
                    <span 
                      key={index}
                      className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}