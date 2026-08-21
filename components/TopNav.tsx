"use client";

import { Bell, Search, Menu, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

interface TopNavProps {
  onMenuClick: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ business_name: string | null; full_name: string | null } | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch(() => {});
  }, [user]);

  const displayName = profile?.business_name || profile?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-muted" />
          </button>
          <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 w-96">
            <Search className="w-4 h-4 text-muted" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search invoices, payments..."
              className="bg-transparent border-none outline-none text-sm text-dark placeholder:text-muted/60 w-full"
              aria-label="Search"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Notifications">
            <Bell className="w-5 h-5 text-muted" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-border">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-dark">{displayName}</p>
              <p className="text-xs text-muted">Finance Lead</p>
            </div>
            <div
              className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white font-medium text-sm"
              aria-label={`${displayName} avatar`}
            >
              {initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
