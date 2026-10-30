"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ShoppingBag, Package, Menu, X, User, Store as StoreIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { getMyStore } from "@/lib/data/stores/client";

const ONBOARDING_PATH = "/store/onboarding";
const HOMEPAGE_PATH = "/store";
const ALLOWED_WHEN_NO_STORE = new Set([HOMEPAGE_PATH, ONBOARDING_PATH]);

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [gateResolved, setGateResolved] = useState(false);
  const { totalItems } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setGateResolved(true);
      return;
    }
    if (pathname === ONBOARDING_PATH) {
      setGateResolved(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const store = await getMyStore();
        if (cancelled) return;
        if (!store && !ALLOWED_WHEN_NO_STORE.has(pathname)) {
          router.replace(ONBOARDING_PATH);
          return;
        }
        setStoreName(store?.name || null);
      } catch (err: any) {
        if (cancelled) return;
        console.error("STORE_LAYOUT_GATE_ERROR", err);
        setStoreName(null);
      } finally {
        if (!cancelled) setGateResolved(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, pathname, router]);

  const headerName = storeName || user?.user_metadata?.business_name || user?.user_metadata?.full_name || "My Store";

  const navigation = [
    { name: "Store Home", href: "/store", icon: Package, show: !!storeName },
    { name: "Products", href: "/store/products", icon: ShoppingBag, show: !!storeName },
    { name: "Cart", href: "/store/cart", icon: ShoppingBag, badge: totalItems, show: !!storeName },
  ];

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
              <StoreIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-dark truncate">{headerName}</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-muted" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.filter((i) => i.show).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative",
                    isActive
                      ? "bg-primary-light text-primary"
                      : "text-muted hover:bg-gray-50 hover:text-dark"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:bg-gray-50 hover:text-dark transition-colors"
            >
              <User className="w-5 h-5" />
              Admin Dashboard
            </Link>
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
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5 text-muted" />
            </button>
            <div className="flex-1 lg:hidden">
              <Link href={storeName ? "/store/products" : "/store/onboarding"} className="text-lg font-bold text-dark truncate">
                {headerName}
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {storeName && (
                <Link href="/store/cart">
                  <Button variant="ghost" size="sm" className="relative">
                    <ShoppingBag className="w-5 h-5" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>
        <main className="p-6 lg:p-8">{gateResolved ? children : null}</main>
      </div>
    </div>
  );
}
