import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { NetworkInfo } from "@/components/network-info";
import { useState } from "react";

interface Transaction {
  id: number;
  transactionId: string;
  timestamp: string;
  transactionType: string;
}

export default function Transactions() {
  const [selectedNetwork, setSelectedNetwork] = useState("Preprod");

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", { network: selectedNetwork }],
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
      </div>

      <NetworkInfo 
        selectedNetwork={selectedNetwork}
        onNetworkChange={setSelectedNetwork}
      />

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/5">
                <TableHead>Transaction ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-muted/5">
                  <TableCell className="font-mono text-sm">{transaction.transactionId}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-muted/30">
                      {transaction.transactionType}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(transaction.timestamp), 'PPp')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}