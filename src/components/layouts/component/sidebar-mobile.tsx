"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

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
              <Image src="/kodosumi_logo.svg" alt="Logo" width={32} height={32} />
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
