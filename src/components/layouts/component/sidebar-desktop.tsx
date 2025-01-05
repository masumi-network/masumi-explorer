"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const menuItems = [
  { title: 'Dashboard', href: '/' },
  { title: 'Transactions', href: '/transactions' },
  { title: 'Agents', href: '/agents' },
  { title: 'Verify', href: '/verify' },
];

interface SidebarDesktopProps {
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export default function SidebarDesktop({ isCollapsed, onCollapsedChange }: SidebarDesktopProps) {
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
            <Image
              src="/kodosumi_logo.svg"
              alt="Kodosumi"
              width={191}
              height={32}
              priority
            />
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
          {/* Section Label */}
          <div className="px-6 py-4">
            <p className="text-zinc-500 text-sm">Menu</p>
          </div>

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
    </div>
  );
}
