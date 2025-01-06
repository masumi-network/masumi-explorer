"use client";

import { useBlockfrost } from '@/hooks/use-blockfrost';
import { useNetwork } from '@/context/network-context';

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
        // Process transactions...
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
    return <div>Loading transactions...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Transactions</h1>
        <p className="text-[#71717A]">All smart contract transactions</p>
      </div>

      <div className="space-y-4">
        {transactions?.map((tx) => (
          <div key={tx.txHash} className="p-4 border border-zinc-800 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-[#71717A]">
                  {new Date(tx.timestamp).toLocaleString()}
                </p>
                <p className="text-xs font-mono text-[#71717A] mt-2">
                  From: {tx.sender}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-white">
                  {(tx.amount / 1000000).toFixed(2)} ₳
                </p>
              </div>
            </div>
          </div>
        ))}

        {(!transactions || transactions.length === 0) && (
          <div className="text-center text-[#71717A] py-8">
            No transactions found
          </div>
        )}
      </div>
    </div>
  );
} 