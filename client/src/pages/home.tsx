import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AreaChartDemo } from "@/components/charts/area-chart";
import { BarChartDemo } from "@/components/charts/bar-chart";
import { Menu, Search } from "lucide-react";
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

export default function Home() {
  const [isNavOpen, setIsNavOpen] = useState(false);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <nav className="flex flex-col gap-4 mt-8">
                  <Button variant="ghost" className="justify-start">Dashboard</Button>
                  <Button variant="ghost" className="justify-start">Analytics</Button>
                  <Button variant="ghost" className="justify-start">Settings</Button>
                </nav>
              </SheetContent>
            </Sheet>
            <img 
              src="https://images.unsplash.com/photo-1471086569966-db3eebc25a59" 
              alt="Logo" 
              className="h-8 w-8 rounded-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
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
        <div className="grid md:grid-cols-2 gap-6 mb-12">
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

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
            <AreaChartDemo />
          </div>
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-4">Monthly Sales</h3>
            <BarChartDemo />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 Dashboard. All rights reserved.
        </div>
      </footer>
    </div>
  );
}