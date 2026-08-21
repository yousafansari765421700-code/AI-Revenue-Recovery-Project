"use client";

import { DollarSign, TrendingDown, TrendingUp, Percent } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface KpiCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
  comparison: string;
}

function KpiCard({ title, value, change, icon, iconColor, bgColor, comparison }: KpiCardProps) {
  const isPositive = change >= 0;
  const isNeutral = title === "Recovery Rate";

  return (
    <Card hover padding="md">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-success" : "text-danger"}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change).toFixed(1)}%
        </div>
      </div>
      <p className="text-2xl font-bold text-dark mb-1">{value}</p>
      <p className="text-sm text-muted">{title}</p>
      <p className="text-xs text-muted mt-2">{comparison}</p>
    </Card>
  );
}

interface KPICardsProps {
  totalRevenue: number;
  lostRevenue: number;
  recoveredRevenue: number;
  recoveryRate: number;
  totalRevenueChange: number;
  lostRevenueChange: number;
  recoveredRevenueChange: number;
  recoveryRateChange: number;
}

export default function KPICards({
  totalRevenue,
  lostRevenue,
  recoveredRevenue,
  recoveryRate,
  totalRevenueChange,
  lostRevenueChange,
  recoveredRevenueChange,
  recoveryRateChange,
}: KPICardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <KpiCard
        title="Total Revenue"
        value={formatCurrency(totalRevenue)}
        change={totalRevenueChange}
        icon={<DollarSign className="w-6 h-6" />}
        iconColor="text-primary"
        bgColor="bg-primary-light"
        comparison="vs previous period"
      />
      <KpiCard
        title="Lost Revenue"
        value={formatCurrency(lostRevenue)}
        change={lostRevenueChange}
        icon={<TrendingDown className="w-6 h-6" />}
        iconColor="text-danger"
        bgColor="bg-danger-light"
        comparison="failed + overdue invoices"
      />
      <KpiCard
        title="Recovered Revenue"
        value={formatCurrency(recoveredRevenue)}
        change={recoveredRevenueChange}
        icon={<TrendingUp className="w-6 h-6" />}
        iconColor="text-success"
        bgColor="bg-success-light"
        comparison="from recovery campaigns"
      />
      <KpiCard
        title="Recovery Rate"
        value={`${recoveryRate.toFixed(1)}%`}
        change={recoveryRateChange}
        icon={<Percent className="w-6 h-6" />}
        iconColor="text-accent"
        bgColor="bg-accent-light"
        comparison="recovery success rate"
      />
    </div>
  );
}
