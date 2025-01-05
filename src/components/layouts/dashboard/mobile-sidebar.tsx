"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import routes from "@/lib/routes";
import { useEffect, useState, MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { useAppContext } from "@/hooks/useAppContext";
import { setMobileSidenav } from "@/context/app-context";
import ShadcnKit from "@/components/icons/shadcn-kit";
import { ScrollArea } from "@/components/ui/scroll-area";
import SidebarItem from "./sidebar-item";

const MobileSidebar = () => {
  const url = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const { state, dispatch } = useAppContext();
  const { mobileSidenav } = state;

  const handleOpen = (value: string | null) => {
    if (value === open) {
      setOpen(null);
    } else {
      setOpen(value);
    }
  };

  const dropDown = (name: string) => {
    if (open === name) {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    const path = `/${url?.split("/")[1] || ""}`;
    setOpen(path);
    dropDown(path);
  }, [url]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
        mobileSidenav ? "block" : "hidden"
      )}
      onClick={() => dispatch(setMobileSidenav(false))}
    >
      <ScrollArea
        onClick={(e: MouseEvent) => e.stopPropagation()}
        className="w-64 h-full border-r bg-background px-4"
      >
        <Link href="/" className="flex items-center gap-4 py-6 px-4">
          <ShadcnKit />
        </Link>

        <div className="space-y-4">
          {routes.map(({ title, pages }, key) => (
            <div key={key} className="py-2">
              <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-medium">
                {title}
              </h4>
              {pages.map(({ Icon, name, path, childItems = [] }) => (
                <SidebarItem
                  key={name}
                  url={url || '/'}
                  path={path}
                  Icon={Icon}
                  name={name}
                  compact={false}
                  childItems={childItems}
                  compactSpace="px-2"
                  compactHide="block"
                  dropDown={dropDown}
                  handleOpen={handleOpen}
                />
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MobileSidebar;
