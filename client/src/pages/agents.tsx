import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";

interface Agent {
  id: number;
  name: string;
  description: string;
  creatorName: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export default function Agents() {
  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

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
            {agents.map((agent) => (
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
    </div>
  );
}