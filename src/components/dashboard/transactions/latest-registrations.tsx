"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchFromBlockfrost } from "@/lib/blockfrost";
import { useNetwork } from "@/context/network-context";

export default function LatestRegistrations({ className, ...props }: any) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { config } = useNetwork();

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const allRegistrations = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const assets = await fetchFromBlockfrost(
            `/assets/policy/${config.policyId}?page=${page}&count=100`,
            config
          );
          
          if (assets.length === 0) {
            hasMore = false;
            break;
          }

          // Process assets in parallel
          const assetDetails = await Promise.all(
            assets.map(asset => 
              fetchFromBlockfrost(`/assets/${asset.asset}`, config)
            )
          );

          allRegistrations.push(...assetDetails);
          
          // Break if we have enough registrations
          if (allRegistrations.length >= 5) {
            break;
          }

          page++;
        }

        // Sort by mint time and take latest 5
        const latestRegistrations = allRegistrations
          .slice(0, 5)
          .map(registration => ({
            // ... rest of your mapping logic
          }));

        setRegistrations(latestRegistrations);
      } catch (err) {
        console.error('Error fetching registrations:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch registrations');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [config]);

  // Rest of your component...
} 