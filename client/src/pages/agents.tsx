import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNetwork } from "@/components/layout";

interface Agent {
  id: number;
  name: string;
  description: string;
  creatorName: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export default function Agents() {
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const { selectedNetwork } = useNetwork();

  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["/api/agents", { network: selectedNetwork }],
  });

  // Filter agents by the selected network
  const networkAgents = agents.filter(agent => 
    agent.metadata?.network === selectedNetwork
  );

  const totalPages = Math.ceil(networkAgents.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentPageAgents = networkAgents.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
      </div>

      <div className="rounded-md border border-border/40">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/5">
              <TableHead className="w-[140px]">Timestamp</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPageAgents.map((agent) => (
              <TableRow key={agent.id} className="hover:bg-muted/5">
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {format(parseISO(agent.createdAt), "MM-dd-yyyy\nHH:mm:ss")}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{agent.name}</span>
                    <span className="text-xs text-muted-foreground">{agent.creatorName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[500px] truncate text-sm">
                    {agent.description}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}