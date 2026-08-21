"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Target, TrendingUp } from "lucide-react";

interface RecoveryOpportunity {
  id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  probability: number;
  recommended_action: string;
  failure_reason: string | null;
}

interface RecoveryOpportunitiesProps {
  opportunities: RecoveryOpportunity[];
}

export default function RecoveryOpportunities({ opportunities }: RecoveryOpportunitiesProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return "text-success";
    if (probability >= 40) return "text-warning";
    return "text-danger";
  };

  const getProbabilityBg = (probability: number) => {
    if (probability >= 70) return "bg-success-light";
    if (probability >= 40) return "bg-warning-light";
    return "bg-danger-light";
  };

  if (opportunities.length === 0) {
    return (
      <Card padding="lg">
        <div className="text-center py-12">
          <p className="text-muted text-lg">No recovery opportunities found</p>
          <p className="text-muted text-sm mt-2">All failed payments have been recovered or are not yet eligible</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-dark">Top Recovery Opportunities</h3>
          <p className="text-sm text-muted">High-potential recovery candidates</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Target className="w-4 h-4" />
          <span>{opportunities.length} opportunities</span>
        </div>
      </div>

      <div className="space-y-4">
        {opportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-background hover:bg-white border border-border hover:border-primary/20 transition-all duration-200"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <p className="font-medium text-dark truncate">{opportunity.customer_name}</p>
                <Badge variant="primary" size="sm">{opportunity.customer_email}</Badge>
              </div>
              <p className="text-sm text-muted mb-2">{opportunity.recommended_action}</p>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted">Reason: {opportunity.failure_reason || "N/A"}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:ml-4">
              <div className="text-right">
                <p className="text-sm font-medium text-muted">Potential Revenue</p>
                <p className="text-lg font-bold text-dark">{formatCurrency(opportunity.amount)}</p>
              </div>
              <div className={`px-3 py-1.5 rounded-lg ${getProbabilityBg(opportunity.probability)}`}>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className={`w-4 h-4 ${getProbabilityColor(opportunity.probability)}`} />
                  <span className={`text-sm font-semibold ${getProbabilityColor(opportunity.probability)}`}>
                    {opportunity.probability}%
                  </span>
                </div>
                <p className="text-xs text-muted mt-0.5">Probability</p>
              </div>
              <Button size="sm">Recover</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
