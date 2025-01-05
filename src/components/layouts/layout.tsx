import { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/components/layouts/component/navbar";
import SidebarMobile from "@/components/layouts/component/sidebar-mobile";
import SidebarDesktop from "@/components/layouts/component/sidebar-desktop";
import Footer from "@/components/layouts/component/footer";
import { Plus, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardanoWallet } from '@meshsdk/react';
import { useTheme } from "next-themes";

export default function Layout({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-zinc-950">
      <SidebarDesktop />
      <SidebarMobile />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <div className="flex h-16 items-center justify-end border-b border-zinc-800 px-4 gap-4 bg-zinc-950">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-zinc-100"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
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