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
      <SheetContent side="left" className="w-64 p-0 bg-zinc-950 border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <Image
            src="/kodosumi_logo.svg"
            alt="Kodosumi"
            width={119}
            height={32}
            priority
          />
        </div>

        {/* Section Label */}
        <div className="px-6 py-6">
          <p className="text-xs text-zinc-500">Menu</p>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium",
                  isActive 
                    ? "bg-emerald-500/10 text-emerald-500" 
                    : "text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-100"
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
