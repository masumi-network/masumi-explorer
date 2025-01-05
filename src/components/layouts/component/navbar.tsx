"use client";

import { CardanoWallet } from '@meshsdk/react';
import { useWallet } from '@meshsdk/react';
import SidebarMobile from './sidebar-mobile';
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { connected } = useWallet();
  const { theme, setTheme } = useTheme();

  return (
    <div className="border-b border-border">
      <div className="flex h-16 items-center gap-4 px-4">
        <div className="lg:hidden">
          <SidebarMobile />
        </div>

        <div className="ml-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <CardanoWallet 
            label={connected ? "Connected" : "Connect Wallet"}
          />
        </div>
      </div>
    </div>
  );
}
