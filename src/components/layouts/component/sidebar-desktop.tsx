"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomCardanoWallet } from "@/components/ui/cardano-wallet";

const menuItems = [
  { title: 'Dashboard', href: '/' },
  { title: 'Transactions', href: '/transactions' },
  { title: 'Agents', href: '/agents' },
  { title: 'Verify', href: '/verify' },
];

interface SidebarDesktopProps {
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  footer?: React.ReactNode;
}

export default function SidebarDesktop({ 
  isCollapsed, 
  onCollapsedChange,
  footer
}: SidebarDesktopProps) {
  const pathname = usePathname();

  return (
    <div className={cn(
      "hidden lg:flex flex-col fixed h-screen border-r border-zinc-800/50 bg-black transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "flex items-center border-b border-zinc-800/50 transition-all duration-300",
        isCollapsed ? "h-16 justify-center" : "h-[72px] justify-between px-6"
      )}>
        {!isCollapsed && (
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <div className="w-[120px] h-[32px]">
              <Image
                src="/masumi_logo.png"
                alt="Masumi"
                width={120}
                height={32}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>
          </Link>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "text-zinc-400 hover:text-zinc-100",
            isCollapsed && "px-0 w-auto h-auto"
          )}
          onClick={() => onCollapsedChange(!isCollapsed)}
        >
          <ChevronLeft className={cn(
            "h-5 w-5 transition-transform",
            isCollapsed && "rotate-180"
          )} />
        </Button>
      </div>

      {!isCollapsed && (
        <>
          {/* Main Navigation */}
          <nav className="flex-1 px-3 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-3 rounded-lg text-base",
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
        </>
      )}

      {!isCollapsed && (
        <div className="p-4 border-t border-zinc-800/50">
            <div className="[&_button]:w-full [&_button]:rounded-md [&_button]:bg-transparent [&_button]:hover:bg-zinc-900 [&_button]:text-white hover:[&_button]:text-white [&_button]:border [&_button]:border-zinc-800 [&_button]:text-sm [&_button]:font-medium">
            <CustomCardanoWallet />
            </div>
        </div>
      )}
    </div>
  );
}
