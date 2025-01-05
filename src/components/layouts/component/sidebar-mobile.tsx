"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  CheckCircle 
} from "lucide-react";

const menuItems = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { title: 'Transactions', icon: FileText, href: '/transactions' },
  { title: 'Agents', icon: Users, href: '/agents' },
  { title: 'Verify', icon: CheckCircle, href: '/verify' },
];

export default function SidebarMobile() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Registry</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
