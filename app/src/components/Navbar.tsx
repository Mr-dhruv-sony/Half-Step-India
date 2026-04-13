"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { getRoleLabel, hasRoleAccess, MANAGEMENT_ROLES } from "@/lib/access";

interface NavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/assets", label: "Assets", icon: "🏗️" },
  { href: "/reports", label: "Reports", icon: "📝" },
  { href: "/alerts", label: "Alerts", icon: "🔔", roles: MANAGEMENT_ROLES },
  { href: "/work-orders", label: "Work Orders", icon: "🔧", roles: MANAGEMENT_ROLES },
];

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const visibleNavItems = navItems.filter(
    (item) => !item.roles || hasRoleAccess(user?.role, item.roles)
  );

  return (
    <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 min-h-screen flex flex-col">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🇮🇳</span>
          <div>
            <h1 className="font-bold text-lg text-zinc-900 dark:text-white">
              Half-Step India
            </h1>
            <p className="text-xs text-zinc-500">Infrastructure Monitor</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="mb-4 px-4">
          <p className="text-sm font-medium text-zinc-900 dark:text-white">
            {user?.name || "User"}
          </p>
          <p className="text-xs text-zinc-500">{getRoleLabel(user?.role)}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <span>🚪</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
