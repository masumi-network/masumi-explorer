"use client";

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { fetchFromBlockfrost } from '@/lib/blockfrost';
import { useNetwork } from '@/context/network-context';

export function useBlockfrost<TData = any>(
  endpoint: string,
  options: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'> = {}
) {
  const { config } = useNetwork();

  return useQuery<TData>({
    queryKey: ['blockfrost', endpoint],
    queryFn: async () => {
      const data = await fetchFromBlockfrost(endpoint, config);
      return data as TData;
    },
    ...options,
  });
} 