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

export function Layout({ children }: LayoutProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Filter results based on search query
  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.creatorName.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3); // Show only first 3 results

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.transactionType.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3); // Show only first 3 results

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <div className="flex items-center gap-4">
              <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <nav className="flex flex-col gap-4 mt-8">
                    <Link href="/">
                      <Button variant="ghost" className="justify-start w-full">Dashboard</Button>
                    </Link>
                    <Link href="/agents">
                      <Button variant="ghost" className="justify-start w-full">Agents</Button>
                    </Link>
                    <Link href="/transactions">
                      <Button variant="ghost" className="justify-start w-full">Transactions</Button>
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
              <h1 className="text-xl font-semibold">Analytics Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input 
              className="w-full pl-12 h-14 text-lg rounded-full border-2 transition-all duration-200 ease-in-out
                       group-hover:border-primary/50 group-hover:shadow-md
                       focus-visible:border-primary focus-visible:shadow-lg
                       bg-background/95 backdrop-blur-sm" 
              placeholder="Search anything..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(e.target.value.length > 0);
              }}
            />

            {/* Search Results Preview */}
            {showResults && searchQuery && (
              <Card className="absolute top-full left-0 right-0 mt-2 shadow-lg border-2 overflow-hidden">
                <CardContent className="p-4">
                  {filteredAgents.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Agents</h3>
                      {filteredAgents.map((agent) => (
                        <Link key={agent.id} href={`/agents/${agent.id}`}> {/* Added agent.id to the href */}
                          <div className="p-2 hover:bg-muted/50 rounded-md cursor-pointer">
                            <p className="font-medium">{agent.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{agent.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {filteredTransactions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Transactions</h3>
                      {filteredTransactions.map((transaction) => (
                        <Link key={transaction.id} href={`/transactions/${transaction.id}`}> {/* Added transaction.id to the href */}
                          <div className="p-2 hover:bg-muted/50 rounded-md cursor-pointer">
                            <p className="font-medium">{transaction.transactionId}</p>
                            <p className="text-sm text-muted-foreground">{transaction.transactionType}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {filteredAgents.length === 0 && filteredTransactions.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No results found</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
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