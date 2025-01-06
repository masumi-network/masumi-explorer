"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useLatestPayments } from "@/hooks/use-latest-payments";
import { formatDistanceToNow } from 'date-fns';

export default function LatestPayments() {
  const { payments, isLoading } = useLatestPayments();

  if (isLoading) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-medium text-white">Latest Payments</h2>
              <p className="text-sm text-[#71717A]">Recent transactions on the network</p>
            </div>
          </div>
          <div className="text-center text-[#71717A]">
            Loading transactions...
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-white">Latest Payments</h2>
            <p className="text-sm text-[#71717A]">Recent transactions on the network</p>
          </div>
          <Button variant="ghost" size="icon" className="text-[#71717A] hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-auto h-[400px] -mx-6">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="pl-6 bg-[#0A0A0A] sticky top-0">FROM</TableHead>
                <TableHead className="text-right bg-[#0A0A0A] sticky top-0">AMOUNT</TableHead>
                <TableHead className="text-right pr-6 bg-[#0A0A0A] sticky top-0">TIME</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((tx) => (
                <TableRow 
                  key={tx.txHash} 
                  className="border-zinc-800"
                >
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[#71717A]">{tx.sender}</span>
                      <Link 
                        href={`https://preprod.cardanoscan.io/transaction/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#71717A] hover:text-white"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {(tx.amount / 1000000).toFixed(2)} ₳
                  </TableCell>
                  <TableCell className="text-right pr-6 text-[#71717A]">
                    {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
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