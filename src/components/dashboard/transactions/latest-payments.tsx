"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowRight, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchFromBlockfrost } from "@/lib/blockfrost";
import { useNetwork } from "@/context/network-context";
import { Card } from "@/components/ui/card";

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
  const { config } = useNetwork();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        
        const data = await fetchFromBlockfrost(
          `/addresses/${config.contractAddress}/transactions`,
          config
        );
        
        const txPromises = data.slice(0, 10).map(async (tx: any) => {
          const txDetails = await fetchFromBlockfrost(`/txs/${tx.tx_hash}/utxos`, config);
          const lovelaceOutput = txDetails.outputs.find((output: any) => 
            output.address === config.contractAddress
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
  }, [config]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Loading transactions...</p>
      </div>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-white">Latest Transactions</h2>
            <p className="text-sm text-[#71717A]">Recent payments on the network</p>
          </div>
          <Link href="/transactions">
            <Button variant="ghost" size="sm" className="gap-2 text-[#71717A] hover:text-white">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="overflow-auto h-[400px] -mx-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 bg-[#0A0A0A] sticky top-0">TRANSACTION</TableHead>
                <TableHead className="text-right pr-6 bg-[#0A0A0A] sticky top-0">AMOUNT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow 
                  key={tx.hash} 
                  className="hover:bg-zinc-900/40 border-zinc-800"
                >
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
    </Card>
  );
} 