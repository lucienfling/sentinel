import { Link, useLocation } from "wouter";
import { useClerk } from "@clerk/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Activity,
  MessageSquare,
  Cable,
  Settings,
  LogOut,
  CreditCard,
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();
  const { signOut } = useClerk();

  const navigation = [
    { name: "Briefing", href: "/dashboard", icon: LayoutDashboard },
    { name: "Analytics", href: "/analytics", icon: Activity },
    { name: "AI Analyst", href: "/chat", icon: MessageSquare },
    { name: "Data Sources", href: "/integrations", icon: Cable },
  ];

  const secondaryNavigation = [
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Subscription", href: "/subscribe", icon: CreditCard },
  ];

  return (
    <div className="flex h-full w-[240px] flex-col border-r border-border bg-card">
      <div className="flex h-16 shrink-0 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <img src="/logo.svg" alt="Sentinel Logo" className="h-8 w-8" />
          <span className="font-light tracking-widest text-lg text-foreground uppercase">Sentinel</span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto pt-6 px-4">
        <div className="space-y-1">
          <div className="px-2 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Command Center
          </div>
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="mt-8 space-y-1">
          <div className="px-2 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            System
          </div>
          {secondaryNavigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border p-4">
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
          Disconnect
        </button>
      </div>
    </div>
  );
}