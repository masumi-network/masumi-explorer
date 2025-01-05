import { ReactNode, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/components/layouts/component/navbar";
import SidebarMobile from "@/components/layouts/component/sidebar-mobile";
import SidebarDesktop from "@/components/layouts/component/sidebar-desktop";
import Footer from "@/components/layouts/component/footer";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardanoWallet } from '@meshsdk/react';
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <SidebarDesktop 
        isCollapsed={isSidebarCollapsed} 
        onCollapsedChange={setIsSidebarCollapsed}
      />
      <SidebarMobile />
      
      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300",
        isSidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
      )}>
        <div className="flex h-16 items-center justify-end border-b border-zinc-800 px-4 gap-4 bg-black">
          <Link href="/register-agent">
            <Button className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
              <Plus className="mr-2 h-4 w-4" />
              Register New Agent
            </Button>
          </Link>
          <div className="[&_button]:!text-zinc-100 [&_button]:!bg-zinc-900 [&_button]:!border-zinc-800 [&_button]:!hover:bg-zinc-800">
            <CardanoWallet />
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