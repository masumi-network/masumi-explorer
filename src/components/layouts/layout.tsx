"use client";

import { ReactNode, useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/components/layouts/component/navbar";
import SidebarMobile from "@/components/layouts/component/sidebar-mobile";
import SidebarDesktop from "@/components/layouts/component/sidebar-desktop";
import Footer from "@/components/layouts/component/footer";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardanoWallet, ConnectWallet } from '@meshsdk/react';
import { cn } from "@/lib/utils";
import { useNetwork } from "@/context/network-context";
import { useSearchParams, useRouter } from 'next/navigation';
import Image from "next/image";

export default function Layout({ children }: { children: ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { network, setNetwork } = useNetwork();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sync network state with URL on mount
  useEffect(() => {
    const networkParam = searchParams.get('network');
    if (networkParam && (networkParam === 'mainnet' || networkParam === 'preprod')) {
      setNetwork(networkParam);
    }
  }, [searchParams, setNetwork]);

  const updateNetwork = (newNetwork: 'mainnet' | 'preprod') => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('network', newNetwork);
    
    // Update URL without reload
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${window.location.pathname}${query}`);
    
    setNetwork(newNetwork);
  };

  return (
    <div className="min-h-screen bg-black">
      <SidebarDesktop 
        isCollapsed={isSidebarCollapsed} 
        onCollapsedChange={setIsSidebarCollapsed}
        footer={
          <div className="p-6 space-y-3 border-t border-[#1F1F1F]">
            <Link href="/register-agent" className="w-full">
              <Button className="w-full bg-transparent hover:bg-zinc-900 text-white rounded-md border border-zinc-800 text-sm font-medium">
                <Plus className="mr-2 h-4 w-4" />
                Register New Agent
              </Button>
            </Link>
            <div className="[&_button]:w-full [&_button]:rounded-md [&_button]:bg-transparent [&_button]:hover:bg-zinc-900 [&_button]:text-white hover:[&_button]:text-white [&_button]:border [&_button]:border-zinc-800 [&_button]:text-sm [&_button]:font-medium">
              <CardanoWallet />
            </div>
          </div>
        }
      />

      <SidebarMobile />
      
      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300",
        isSidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
      )}>
        <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4 bg-black">
          <div className="flex items-center gap-6">
            <button
              onClick={() => updateNetwork('mainnet')}
              className={cn(
                "text-sm transition-colors rounded-lg px-4 py-2",
                network === 'mainnet' 
                  ? "bg-zinc-900 text-white" 
                  : "text-zinc-500 hover:text-zinc-400"
              )}
            >
              Mainnet
            </button>
            <button
              onClick={() => updateNetwork('preprod')}
              className={cn(
                "text-sm transition-colors rounded-lg px-4 py-2",
                network === 'preprod' 
                  ? "bg-zinc-900 text-white" 
                  : "text-zinc-500 hover:text-zinc-400"
              )}
            >
              Preprod
            </button>
          </div>
        </div>
        
        <main className="flex-1 p-6">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
} 