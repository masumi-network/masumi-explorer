"use client";

import { useState, useEffect } from 'react';
import { useBlockfrostCache } from '@/context/blockfrost-cache-context';
import { useNetwork } from '@/context/network-context';

interface DashboardStats {
  totalAgents: number;
  monthlyAgents: {
    current: number;
    change: number;
  };
  totalTransactions: {
    count: number;
  };
  monthlyTransactions: {
    count: number;
    change: number;
  };
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    monthlyAgents: { current: 0, change: 0 },
    totalTransactions: { count: 0 },
    monthlyTransactions: { count: 0, change: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const { fetchCached } = useBlockfrostCache();
  const { config } = useNetwork();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get all agents
        const assets = await fetchCached(`/assets/policy/${config.policyId}`);
        
        // Get mint transactions for each asset to get accurate timestamps
        const assetsWithDates = await Promise.all(
          assets.map(async (asset: any) => {
            const assetDetails = await fetchCached(`/assets/${asset.asset}`);
            const tx = await fetchCached(`/txs/${assetDetails.initial_mint_tx_hash}`);
            return {
              ...asset,
              mintTimestamp: tx.block_time * 1000 // Convert to milliseconds
            };
          })
        );

        const totalAgents = assets?.length || 0;

        // Get current month's agents
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const currentMonthAgents = assetsWithDates.filter(asset => {
          const mintDate = new Date(asset.mintTimestamp);
          return mintDate.getMonth() === currentMonth && 
                 mintDate.getFullYear() === currentYear;
        }).length;

        const lastMonthAgents = assetsWithDates.filter(asset => {
          const mintDate = new Date(asset.mintTimestamp);
          return mintDate.getMonth() === lastMonth && 
                 mintDate.getFullYear() === lastMonthYear;
        }).length;

        const agentChange = lastMonthAgents ? 
          ((currentMonthAgents - lastMonthAgents) / lastMonthAgents) * 100 : 0;

        console.log('Stats calculation:', {
          totalAgents,
          currentMonthAgents,
          lastMonthAgents,
          agentChange
        });

        // Get all transactions
        const txs = await fetchCached(`/addresses/${config.contractAddress}/utxos`);
        console.log('Transactions:', txs);

        // Get transaction history
        const txHistory = await fetchCached(`/addresses/${config.contractAddress}/transactions`);
        console.log('Transaction history:', txHistory);

        const totalTxCount = txHistory?.length || 0;

        // Current month transactions
        const currentMonthTxs = txHistory?.filter((tx: any) => {
          const txDate = new Date(tx.block_time * 1000);
          return txDate.getMonth() === currentMonth &&
                 txDate.getFullYear() === currentYear;
        }) || [];

        const lastMonthTxs = txHistory?.filter((tx: any) => {
          const txDate = new Date(tx.block_time * 1000);
          return txDate.getMonth() === lastMonth &&
                 txDate.getFullYear() === lastMonthYear;
        }) || [];

        const txChange = lastMonthTxs.length ? 
          ((currentMonthTxs.length - lastMonthTxs.length) / lastMonthTxs.length) * 100 : 0;

        console.log('Transaction stats:', {
          totalTxCount,
          currentMonthTxs: currentMonthTxs.length,
          lastMonthTxs: lastMonthTxs.length,
          txChange
        });

        setStats({
          totalAgents,
          monthlyAgents: {
            current: currentMonthAgents,
            change: agentChange
          },
          totalTransactions: {
            count: totalTxCount
          },
          monthlyTransactions: {
            count: currentMonthTxs.length,
            change: txChange
          }
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [fetchCached, config]);

  return { stats, isLoading };
} 