"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowRight, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchFromBlockfrost } from "@/lib/blockfrost";

const PAYMENT_CONTRACT = "addr_test1wr3hvt2hw89l6ay85lr0f2nr80tckrnpjr808dxhq39xkssvw7mx8";

interface Transaction {
  hash: string;
  amount: string;
  timestamp: number;
  sender: string;
}

export default function LatestPayments({ className }: { className?: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const txs = await fetchFromBlockfrost(`/addresses/${PAYMENT_CONTRACT}/transactions`);
        
        const txPromises = txs.slice(0, 10).map(async (tx: any) => {
          const txDetails = await fetchFromBlockfrost(`/txs/${tx.tx_hash}/utxos`);
          const lovelaceOutput = txDetails.outputs.find((output: any) => 
            output.address === PAYMENT_CONTRACT
          );
          
          return {
            hash: tx.tx_hash,
            amount: lovelaceOutput?.amount.find((a: any) => a.unit === 'lovelace')?.quantity || '0',
            timestamp: tx.block_time * 1000,
            sender: txDetails.inputs[0]?.address || 'Unknown',
          };
        });

        const latest = await Promise.all(txPromises);
        const sortedTransactions = latest.sort((a, b) => b.timestamp - a.timestamp);
        setTransactions(sortedTransactions);
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
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100">
        <div className="flex items-center justify-between p-4">
          <h3 className="text-lg font-medium">Latest Payment Transactions</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-zinc-400 border-zinc-800">
              Jan 20, 2023 - Feb 09, 2023
            </Button>
            <Button variant="outline" size="sm" className="text-zinc-400 border-zinc-800">
              Filter
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-zinc-800">
              <TableHead className="text-zinc-400">Timestamp</TableHead>
              <TableHead className="text-zinc-400">Amount</TableHead>
              <TableHead className="text-zinc-400">From</TableHead>
              <TableHead className="text-right text-zinc-400"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.hash} className="hover:bg-zinc-900/40 border-zinc-800">
                <TableCell>
                  <div className="flex flex-col">
                    <span>{new Date(tx.timestamp).toLocaleDateString()}</span>
                    <span className="text-sm text-zinc-500">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{(parseInt(tx.amount) / 1000000).toFixed(2)} ₳</span>
                    <span className="text-sm text-zinc-500">ADA</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  <div className="flex flex-col">
                    <span>{tx.sender.slice(0, 8)}...{tx.sender.slice(-8)}</span>
                    <span className="text-sm text-zinc-500">Address</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 