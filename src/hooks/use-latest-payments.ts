"use client";

import { useState, useEffect } from 'react';
import { useBlockfrostCache } from '@/context/blockfrost-cache-context';
import { useNetwork } from '@/context/network-context';

interface Payment {
  timestamp: number;
  txHash: string;
  amount: number;
  sender: string;
}

export function useLatestPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchCached } = useBlockfrostCache();
  const { config } = useNetwork();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        
        const transactions = await fetchCached(
          `/addresses/${config.contractAddress}/transactions`
        );

        const processedPayments = await Promise.all(
          transactions.map(async (tx: any) => {
            try {
              const txDetails = await fetchCached(`/txs/${tx.tx_hash}/utxos`);
              
              const output = txDetails.outputs.find((out: any) => 
                out.address === config.contractAddress
              );
              
              if (!output) return null;

              const amount = output.amount.find((a: any) => 
                a.unit === 'lovelace'
              )?.quantity || 0;

              const sender = txDetails.inputs?.[0]?.address || 'Unknown';

              return {
                timestamp: tx.block_time * 1000,
                txHash: tx.tx_hash,
                amount: parseInt(amount),
                sender
              } as Payment;
            } catch (error) {
              console.error('Error processing payment:', error);
              return null;
            }
          })
        );

        const validPayments = processedPayments
          .filter((payment): payment is Payment => payment !== null)
          .sort((a, b) => b.timestamp - a.timestamp);

        console.log('Valid payments:', validPayments);
        setPayments(validPayments);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (config.blockfrostApiKey) {
      fetchPayments();
    }
  }, [fetchCached, config]);

  return { payments, isLoading };
} 