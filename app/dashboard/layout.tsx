"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  AlertCircle,
  User,
  Package,
  ShoppingBag,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import TopNav from "@/components/TopNav";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", href: "/dashboard/customers", icon: User },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Failed Payments", href: "/dashboard/failed-payments", icon: AlertCircle },
  { name: "Recovery", href: "/dashboard/recovery", icon: CreditCard },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Store", href: "/store", icon: ShoppingBag },
  { name: "Orders", href: "/dashboard/orders", icon: ClipboardList },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2.5 h-16 px-6 border-b border-border">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-dark">Revenue Recovery</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-muted" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-light text-primary"
                      : "text-muted hover:bg-gray-50 hover:text-dark"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border space-y-1">
            <Link
              href="#help"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:bg-gray-50 hover:text-dark transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              Help & Support
            </Link>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:pl-64">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function SignOutButton() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <button
      onClick={handleSignOut}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:bg-gray-50 hover:text-dark transition-colors"
    >
      <LogOut className="w-5 h-5" />
      Sign Out
    </button>
  );
}
