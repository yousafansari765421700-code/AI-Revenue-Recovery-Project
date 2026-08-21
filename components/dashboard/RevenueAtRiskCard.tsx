"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle } from "lucide-react";

interface RevenueAtRiskCardProps {
  amount: number;
}

export default function RevenueAtRiskCard({ amount }: RevenueAtRiskCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const recoveryPotential = amount * 0.7;

  return (
    <Card padding="lg" hover>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning-light flex items-center justify-center text-warning">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-dark">Revenue at Risk</h3>
            <p className="text-sm text-muted">Pending recovery</p>
          </div>
        </div>
        <Badge variant="warning" size="sm">Attention Needed</Badge>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-3xl font-bold text-dark mb-1">{formatCurrency(amount)}</p>
          <p className="text-sm text-muted">Currently in recovery pipeline</p>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted">Estimated Recovery Potential</span>
            <span className="text-sm font-semibold text-success">{formatCurrency(recoveryPotential)}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-warning to-success" />
          </div>
          <p className="text-xs text-muted mt-1.5">Based on historical recovery rates</p>
        </div>
      </div>
    </Card>
  );
}
