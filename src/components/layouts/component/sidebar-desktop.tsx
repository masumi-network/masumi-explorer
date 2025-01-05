"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  CheckCircle,
  BookOpen,
  Network,
  FileCode2,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNetwork } from "@/context/network-context";
import { Card } from "@/components/ui/card";

const menuItems = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { title: 'Transactions', icon: FileText, href: '/transactions' },
  { title: 'Agents', icon: Users, href: '/agents' },
  { title: 'Verify', icon: CheckCircle, href: '/verify' },
];

const POLICY_ID = "c7842ba56912a2df2f2e1b89f8e11751c6ec2318520f4d312423a272";

// Helper function to format Policy ID
const formatPolicyId = (id: string) => {
  return `${id.slice(0, 8)}...${id.slice(-4)}`;
};

export default function SidebarDesktop() {
  const pathname = usePathname();
  const { network, setNetwork } = useNetwork();

  return (
    <div className="hidden lg:flex flex-col fixed h-screen w-64 border-r border-border bg-background">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Registry</h1>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.title}
            </Link>
          );
        })}

        <Link
          href="https://docs.masumi.network"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted"
        >
          <BookOpen className="w-5 h-5" />
          Documentation
        </Link>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 space-y-4 border-t border-border">
        {/* Policy ID Section */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileCode2 className="w-4 h-4" />
              <span>Agent Directory</span>
            </div>
            <Link 
              href={`https://preprod.cardanoscan.io/tokenPolicy/${POLICY_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
          <div 
            className="text-xs px-2 py-1.5 bg-muted rounded font-mono text-muted-foreground hover:text-foreground transition-colors cursor-copy flex items-center justify-between"
            onClick={() => {
              navigator.clipboard.writeText(POLICY_ID);
            }}
            title="Click to copy full Policy ID"
          >
            <span>{formatPolicyId(POLICY_ID)}</span>
            <span className="text-[10px] text-muted-foreground">Click to copy</span>
          </div>
        </div>

        {/* Network Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <Network className="mr-2 h-4 w-4" />
              {network}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setNetwork('Preprod')}>
              Preprod
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setNetwork('Mainnet')}>
              Mainnet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
