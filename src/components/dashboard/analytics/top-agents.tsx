"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ExternalLink, MessageSquare, ArrowRight, ExternalLinkIcon, Check, X, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchFromBlockfrost } from "@/lib/blockfrost";
import { useNetwork } from "@/context/network-context";
import { Card } from "@/components/ui/card";
import { useTopAgents } from '@/hooks/use-top-agents';

interface Agent {
  asset: string;
  name: string;
  description: string;
  authorName: string;
  registeredAt: string;
  requests: number;
  identityVerified: boolean;
  metadataCorrect: boolean;
}

export default function TopAgents({ className, ...props }: any) {
  const { agents, isLoading } = useTopAgents();

  // Remove the sorting here since it's handled in the hook
  const sortedAgents = agents || [];

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Loading agents...</p>
      </div>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-white">Latest AI Agents</h2>
            <p className="text-sm text-[#71717A]">Recently registered agents on the network</p>
          </div>
        </div>

        <div className="overflow-auto h-[400px] -mx-6">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="w-[400px] pl-6 bg-[#0A0A0A] sticky top-0">AGENT</TableHead>
                <TableHead className="bg-[#0A0A0A] sticky top-0">AUTHOR</TableHead>
                <TableHead className="text-center bg-[#0A0A0A] sticky top-0">REGISTERED</TableHead>
                <TableHead className="text-center bg-[#0A0A0A] sticky top-0">IDENTITY</TableHead>
                <TableHead className="w-[50px] bg-[#0A0A0A] sticky top-0"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAgents.map((agent) => (
                <TableRow 
                  key={agent.asset} 
                  className="border-zinc-800"
                >
                  <TableCell className="pl-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{agent.name}</p>
                        <Link 
                          href={`https://preprod.cardanoscan.io/token/${agent.asset}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#71717A] hover:text-white"
                        >
                          <ExternalLinkIcon className="w-3 h-3" />
                        </Link>
                      </div>
                      <p className="text-sm text-[#71717A] line-clamp-2">{agent.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#71717A]">{agent.authorName}</TableCell>
                  <TableCell className="text-center text-[#71717A]">{agent.registeredAt}</TableCell>
                  <TableCell className="text-center">
                    {agent.identityVerified ? (
                      <div className="flex items-center justify-center text-emerald-500">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-red-500">
                        <X className="w-4 h-4" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" className="text-[#71717A] hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
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