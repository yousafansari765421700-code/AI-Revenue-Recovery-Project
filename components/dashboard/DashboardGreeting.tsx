"use client";

import { Card } from "@/components/ui/Card";

interface DashboardGreetingProps {
  businessName: string | null;
  fullName: string | null;
}

export default function DashboardGreeting({ businessName, fullName }: DashboardGreetingProps) {
  const hour = new Date().getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) greeting = "Good afternoon";
  else if (hour >= 17) greeting = "Good evening";

  const displayName = businessName || fullName || "there";

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-dark mb-2">
        {greeting}, {displayName}
      </h1>
      <p className="text-muted">Here's your revenue recovery overview.</p>
    </div>
  );
}
