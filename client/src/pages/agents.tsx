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
              <TableHead>Input</TableHead>
              <TableHead>Output</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead className="w-[50px]"></TableHead>
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
                  <div className="max-w-[300px] truncate text-sm">
                    {agent.description}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(agent.metadata.capabilities as string[])?.map((capability, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-muted/30"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-500">
                    Running
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                    Single-Node
                  </span>
                </TableCell>
                <TableCell>
                  <button className="h-8 w-8 rounded-md hover:bg-muted/50">
                    <span className="sr-only">Open menu</span>
                    <svg width="15" height="3" viewBox="0 0 15 3" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                      <path d="M2 2.5C2.82843 2.5 3.5 1.82843 3.5 1C3.5 0.171573 2.82843 -0.5 2 -0.5C1.17157 -0.5 0.5 0.171573 0.5 1C0.5 1.82843 1.17157 2.5 2 2.5Z" stroke="currentColor"/>
                      <path d="M7.75 2.5C8.57843 2.5 9.25 1.82843 9.25 1C9.25 0.171573 8.57843 -0.5 7.75 -0.5C6.92157 -0.5 6.25 0.171573 6.25 1C6.25 1.82843 6.92157 2.5 7.75 2.5Z" stroke="currentColor"/>
                      <path d="M13.5 2.5C14.3284 2.5 15 1.82843 15 1C15 0.171573 14.3284 -0.5 13.5 -0.5C12.6716 -0.5 12 0.171573 12 1C12 1.82843 12.6716 2.5 13.5 2.5Z" stroke="currentColor"/>
                    </svg>
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}