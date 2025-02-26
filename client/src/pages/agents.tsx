import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Agent {
  id: number;
  name: string;
  description: string;
  creatorName: string;
  metadata: Record<string, unknown>;
}

export default function Agents() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  // Filter agents based on search query
  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.creatorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AI Agents</h1>
      
      {/* Search Section */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input 
            className="pl-10 h-12 text-lg" 
            placeholder="Search agents..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
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
