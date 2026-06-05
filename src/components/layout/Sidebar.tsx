"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calculator,
  History,
  LayoutDashboard,
  Package,
  Settings,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export interface SidebarUser {
  name: string;
  email: string;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Menghitung", href: "/calculate", icon: Calculator },
  { label: "History", href: "/history", icon: History },
  { label: "Kelola Barang", href: "/products", icon: Package },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Sampah", href: "/trash", icon: Trash2 },
] as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-60 flex-col border-r bg-sidebar text-sidebar-foreground">
      {/* Header / Logo */}
      <div className="flex flex-col gap-0.5 px-5 py-5 border-b">
        <span className="text-xl font-bold tracking-tight font-heading">
          BonKu
        </span>
        <span className="text-xs text-muted-foreground">
          Pembukuan praktis untuk UMKM
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer: user + theme toggle */}
      <div className="border-t p-3">
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3 rounded-lg p-2 transition-colors hover:bg-sidebar-accent/60",
              (pathname === "/profile" || pathname.startsWith("/profile/")) &&
                "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            <Avatar className="size-9">
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
