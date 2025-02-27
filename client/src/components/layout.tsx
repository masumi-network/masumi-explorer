import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Menu, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LayoutProps {
  children: React.ReactNode;
}

interface Agent {
  id: number;
  name: string;
  description: string;
  creatorName: string;
}

interface Transaction {
  id: number;
  transactionId: string;
  transactionType: string;
  timestamp: string;
}

interface NetworkConfig {
  name: string;
  smartContractAddress: string;
  policyId: string;
}

export function Layout({ children }: LayoutProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState("Preprod");

  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", { network: selectedNetwork }],
  });

  const { data: networkConfigs = [] } = useQuery<NetworkConfig[]>({
    queryKey: ["/api/network-configs"],
  });

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.creatorName.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3);

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.transactionType.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3);

  const currentConfig = networkConfigs.find(config => config.name === selectedNetwork);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-6">
                  <nav className="flex flex-col gap-4 mt-8">
                    <Link href="/">
                      <Button variant="ghost" className="w-full justify-start text-lg">
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/agents">
                      <Button variant="ghost" className="w-full justify-start text-lg">
                        Agents
                      </Button>
                    </Link>
                    <Link href="/transactions">
                      <Button variant="ghost" className="w-full justify-start text-lg">
                        Transactions
                      </Button>
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
              <h1 className="text-xl font-semibold tracking-tight">Analytics Dashboard</h1>
            </div>

            {/* Network Selector */}
            <div className="flex items-center gap-3">
              <Select 
                value={selectedNetwork} 
                onValueChange={setSelectedNetwork}
                defaultValue="Preprod"
              >
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {networkConfigs.map(config => (
                    <SelectItem key={config.name} value={config.name}>
                      {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentConfig && (
                <div className="hidden lg:block text-sm text-muted-foreground">
                  <span className="font-mono">{currentConfig.smartContractAddress.slice(0, 8)}...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Network Info Bar */}
      {currentConfig && (
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto px-4">
            <div className="h-12 flex items-center text-sm">
              <div className="flex items-center gap-6 overflow-hidden">
                <span className="flex gap-2 items-center whitespace-nowrap">
                  <span className="text-muted-foreground">Network:</span>
                  <span className="font-medium">{currentConfig.name}</span>
                </span>
                <span className="flex gap-2 items-center overflow-hidden">
                  <span className="text-muted-foreground shrink-0">Contract:</span>
                  <span className="font-mono truncate">{currentConfig.smartContractAddress}</span>
                </span>
                <span className="hidden md:flex gap-2 items-center overflow-hidden">
                  <span className="text-muted-foreground shrink-0">Policy ID:</span>
                  <span className="font-mono truncate">{currentConfig.policyId}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-colors group-focus-within:text-foreground" />
            <Input 
              className="w-full pl-12 pr-4 h-11 text-base rounded-full border-2 transition-all duration-200
                        focus-visible:border-primary focus-visible:shadow-[0_0_0_1px_hsl(var(--primary))]
                        bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" 
              placeholder="Search transactions or agents..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(e.target.value.length > 0);
              }}
            />

            {/* Search Results Preview */}
            {showResults && searchQuery && (
              <Card className="absolute top-full left-0 right-0 mt-2 shadow-lg overflow-hidden z-50">
                <CardContent className="p-4 max-h-[70vh] overflow-y-auto divide-y">
                  {filteredAgents.length > 0 && (
                    <div className="pb-4">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Agents</h3>
                      <div className="space-y-1">
                        {filteredAgents.map((agent) => (
                          <Link key={agent.id} href={`/agents/${agent.id}`}>
                            <div className="p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors">
                              <p className="font-medium">{agent.name}</p>
                              <p className="text-sm text-muted-foreground truncate">{agent.description}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredTransactions.length > 0 && (
                    <div className="pt-4">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Transactions</h3>
                      <div className="space-y-1">
                        {filteredTransactions.map((transaction) => (
                          <Link key={transaction.id} href={`/transactions/${transaction.id}`}>
                            <div className="p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors">
                              <p className="font-medium font-mono">{transaction.transactionId}</p>
                              <p className="text-sm text-muted-foreground">{transaction.transactionType}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredAgents.length === 0 && filteredTransactions.length === 0 && (
                    <div className="py-8">
                      <p className="text-muted-foreground text-center">No results found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8 flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 Dashboard. All rights reserved.
        </div>
      </footer>
    </div>
  );
}