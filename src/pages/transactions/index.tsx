"use client";

import { useEffect, useState } from "react";
import { useWallet } from '@meshsdk/react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchFromBlockfrost } from "@/lib/blockfrost";
import { resolvePaymentKeyHash } from '@meshsdk/core';
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { useNetwork } from "@/context/network-context";

// Add helper function for hex conversion
const hexToString = (hex: string): string => {
  return Buffer.from(hex, 'hex').toString();
};

interface Transaction {
  txHash: string;
  amount: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'refunded';
  referenceId: string;
  buyerPkh: string;
  sellerPkh: string;
  unlockTime: number;
  refundTime: number;
  refundRequested: boolean;
  refundDenied: boolean;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { config } = useNetwork();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const scriptUtxos = await fetchFromBlockfrost(
          `/addresses/addr_test1wr3hvt2hw89l6ay85lr0f2nr80tckrnpjr808dxhq39xkssvw7mx8/utxos`,
          config
        );
        console.log(`Found ${scriptUtxos.length} UTXOs`);

        const decodedTransactions = await Promise.all(
          scriptUtxos.map(async (utxo: any) => {
            try {
              const tx = await fetchFromBlockfrost(
                `/txs/${utxo.tx_hash}/utxos`,
                config
              );
              
              const scriptOutput = tx.outputs.find((output: any) => 
                output.address === 'addr_test1wr3hvt2hw89l6ay85lr0f2nr80tckrnpjr808dxhq39xkssvw7mx8'
              );

              if (!scriptOutput?.inline_datum) return null;

              // Get the datum from Blockfrost
              const datumResponse = await fetchFromBlockfrost(
                `/scripts/datum/${scriptOutput.data_hash}`,
                config
              );

              if (!datumResponse?.json_value) return null;

              const datum = datumResponse.json_value;
              const txDetails = await fetchFromBlockfrost(
                `/txs/${utxo.tx_hash}`,
                config
              );
              
              return {
                txHash: utxo.tx_hash,
                amount: scriptOutput.amount.find((a: any) => a.unit === 'lovelace').quantity,
                timestamp: txDetails.block_time,
                status: 'pending',
                buyerPkh: datum.fields[0].bytes,
                sellerPkh: datum.fields[1].bytes,
                referenceId: Buffer.from(datum.fields[2].bytes, 'hex').toString('utf8'),
                resultHash: datum.fields[3].bytes,
                unlockTime: datum.fields[4].int,
                refundTime: datum.fields[5].int,
                refundRequested: datum.fields[6].constructor === 1,
                refundDenied: datum.fields[7].constructor === 1
              };
            } catch (error) {
              console.error('Error processing transaction:', error);
              return null;
            }
          })
        );

        const validTransactions = decodedTransactions
          .filter(Boolean)
          .sort((a, b) => b.timestamp - a.timestamp);

        setTransactions(validTransactions);
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
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <p className="text-muted-foreground">All smart contract transactions</p>
      </div>

      <div className="space-y-4">
        {transactions.map((tx) => (
          <Card key={tx.txHash} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">Reference ID: {tx.referenceId}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(tx.timestamp * 1000).toLocaleString()}
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-mono">Buyer: {tx.buyerPkh}</p>
                  <p className="text-xs font-mono">Seller: {tx.sellerPkh}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{parseInt(tx.amount) / 1000000} ADA</p>
                <Badge variant={
                  tx.status === 'completed' ? 'default' :
                  tx.status === 'refunded' ? 'destructive' :
                  'secondary'
                }>
                  {tx.status}
                </Badge>
                <div className="mt-2">
                  <Link 
                    href={`https://preprod.cardanoscan.io/transaction/${tx.txHash}`}
                    target="_blank"
                    className="text-xs text-primary hover:underline flex items-center gap-1 justify-end"
                  >
                    View Transaction
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {transactions.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No transactions found
          </div>
        )}
      </div>
    </div>
  );
} 