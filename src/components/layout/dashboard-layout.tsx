"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  CircuitBoard,
  History,
  Settings,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const sidebarItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "AI Agents",
      href: "/agents",
      icon: CircuitBoard,
    },
    {
      title: "History",
      href: "/history",
      icon: History,
    }
  ];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-card">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#f60045]">Masumi</h1>
        </div>
        <ScrollArea className="flex-1 px-4">
          <nav className="flex flex-col gap-2">
            {sidebarItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="lg:hidden fixed left-4 top-4 z-40"
            size="icon"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="p-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#f60045]">Masumi</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <ScrollArea className="px-4">
            <nav className="flex flex-col gap-2">
              {sidebarItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              ))}
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 px-6 py-8">{children}</div>
      </main>
    </div>
  )
}