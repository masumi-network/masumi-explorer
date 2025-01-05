"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchFromBlockfrost } from "@/lib/blockfrost";

const PAYMENT_CONTRACT = "addr_test1wr3hvt2hw89l6ay85lr0f2nr80tckrnpjr808dxhq39xkssvw7mx8";

interface Transaction {
  hash: string;
  amount: string;
  timestamp: string;
  sender: string;
}

export default function LatestPayments({ className }: { className?: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Get address transactions
        const txs = await fetchFromBlockfrost(`/addresses/${PAYMENT_CONTRACT}/transactions`);
        
        // Get details for each transaction
        const txPromises = txs.slice(0, 10).map(async (tx: any) => {
          const txDetails = await fetchFromBlockfrost(`/txs/${tx.tx_hash}/utxos`);
          const lovelaceOutput = txDetails.outputs.find((output: any) => 
            output.address === PAYMENT_CONTRACT
          );
          
          return {
            hash: tx.tx_hash,
            amount: lovelaceOutput?.amount.find((a: any) => a.unit === 'lovelace')?.quantity || '0',
            timestamp: new Date(tx.block_time * 1000).toLocaleString(),
            sender: txDetails.inputs[0]?.address || 'Unknown',
          };
        });

        const latest = await Promise.all(txPromises);
        setTransactions(latest);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="rounded-2xl border bg-card text-card-foreground shadow">
        <div className="p-6 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium">Latest Payment Transactions</h3>
            <p className="text-sm text-muted-foreground">Recent payments through the contract</p>
          </div>
          <Link href="/transactions">
            <Button variant="ghost" size="sm" className="gap-2">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>From</TableHead>
              <TableHead className="text-right">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.hash}>
                <TableCell>{tx.timestamp}</TableCell>
                <TableCell>{(parseInt(tx.amount) / 1000000).toFixed(2)} ₳</TableCell>
                <TableCell className="font-mono text-xs">
                  {tx.sender.slice(0, 8)}...{tx.sender.slice(-8)}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`https://preprod.cardanoscan.io/transaction/${tx.hash}`} target="_blank">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 