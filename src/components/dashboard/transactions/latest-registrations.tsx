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
import { useEffect, useState, ReactNode } from "react";
import { fetchFromBlockfrost } from "@/lib/blockfrost";
import { useNetwork } from "@/context/network-context";
import { Card } from "@/components/ui/card";

interface AssetResponse {
  asset: string;
  onchain_metadata?: {
    name?: string;
    description?: string;
    author?: {
      name?: string;
    };
  };
  initial_mint_tx_hash?: string;
}

interface Registration {
  asset: string;
  name: string;
  description: string;
  authorName: string;
  registeredAt: string;
}

export default function LatestRegistrations() {
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-white">Latest Registrations</h2>
            <p className="text-sm text-[#71717A]">Recent agent registrations</p>
          </div>
        </div>
      </div>
    </Card>
  );
} 