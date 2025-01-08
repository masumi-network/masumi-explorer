"use client";

import { useBlockfrost } from '@/hooks/use-blockfrost';
import { useNetwork } from '@/context/network-context';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from '@/components/ui/button';

interface Transaction {
  timestamp: number;
  txHash: string;
  amount: number;
  sender: string;
}

export default function TransactionsPage() {
  const { config } = useNetwork();

  const { data: transactions, isLoading } = useBlockfrost<Transaction[]>(
    `/addresses/${config.contractAddress}/transactions`,
    {
      select: (data: any) => {
        const processedTransactions = data
          .map((tx: any) => {
            try {
              const transaction: Transaction = {
                timestamp: tx.block_time * 1000,
                txHash: tx.tx_hash,
                amount: parseInt(tx.amount?.find((a: any) => a.unit === 'lovelace')?.quantity || '0'),
                sender: tx.inputs?.[0]?.address || 'Unknown'
              };
              return transaction;
            } catch (error) {
              console.error('Error processing transaction:', error);
              return null;
            }
          })
          .filter((tx: Transaction | null): tx is Transaction => tx !== null);

        return processedTransactions;
      },
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-zinc-400">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Transactions</h1>
          <p className="text-sm text-zinc-400">All smart contract transactions</p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {transactions?.map((tx) => (
          <Card 
            key={tx.txHash} 
            className="bg-zinc-900/50 border-zinc-800 p-4 hover:bg-zinc-900/70 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary"
                    className="bg-zinc-800/50 text-zinc-300 border-zinc-700"
                  >
                    Contract Interaction
                  </Badge>
                  <span className="text-sm text-zinc-400">
                    {new Date(tx.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-mono text-zinc-500">
                    From: {tx.sender}
                  </p>
                  <p className="text-sm font-mono text-zinc-500">
                    Tx: {tx.txHash}
                  </p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <p className="text-lg font-medium text-white">
                  {(tx.amount / 1000000).toFixed(2)} ₳
                </p>
                <Link 
                  href={`https://preprod.cardanoscan.io/transaction/${tx.txHash}`}
                  target="_blank"
                >
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2 bg-transparent border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View on Explorer
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}

        {(!transactions || transactions.length === 0) && (
          <Card className="bg-zinc-900/50 border-zinc-800 p-6">
            <div className="text-center">
              <p className="text-zinc-400">No transactions found</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 