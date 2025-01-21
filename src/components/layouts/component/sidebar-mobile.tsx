"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Plus } from "lucide-react";
import { CustomCardanoWallet } from "@/components/ui/cardano-wallet";

const menuItems = [
  { title: 'Dashboard', href: '/' },
  { title: 'Transactions', href: '/transactions' },
  { title: 'Agents', href: '/agents' },
  { title: 'Verify', href: '/verify' },
];

export default function SidebarMobile() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="lg:hidden text-zinc-400 hover:text-zinc-100">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-[#0A0A0A] border-r border-[#1F1F1F]">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-[120px] h-[32px]">
                <Image
                  src="/masumi_logo.png"
                  alt="Logo"
                  width={120}
                  height={32}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
              <span className="font-semibold text-lg">Masumi</span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-3">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                      isActive 
                        ? "bg-zinc-800/40 text-white" 
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40"
                    )}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-zinc-800/50">
            <Link href="/register-agent" className="w-full">
              <Button className="w-full bg-transparent hover:bg-zinc-900 text-white rounded-md border border-zinc-800 text-sm font-medium">
                <Plus className="mr-2 h-4 w-4" />
                Register New Agent
              </Button>
            </Link>
            <div className="mt-3">
              <CustomCardanoWallet />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
