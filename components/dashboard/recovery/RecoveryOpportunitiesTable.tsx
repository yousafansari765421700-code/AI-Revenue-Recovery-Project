"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";

interface RecoveryOpportunity {
  id: string;
  customer_name: string;
  amount: number;
  failure_type: string;
  recovery_score: number;
  recommended_action: string;
  recovery_status: string;
  detected_at: string;
}

interface RecoveryOpportunitiesTableProps {
  opportunities: RecoveryOpportunity[];
  onStartRecovery: (opportunity: RecoveryOpportunity) => void;
}

const statusVariant: Record<string, "warning" | "primary" | "success" | "danger" | "neutral"> = {
  pending: "warning",
  in_progress: "primary",
  recovered: "success",
  failed: "danger",
};

export default function RecoveryOpportunitiesTable({ opportunities, onStartRecovery }: RecoveryOpportunitiesTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-success";
    if (score >= 40) return "text-warning";
    return "text-danger";
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-success-light";
    if (score >= 40) return "bg-warning-light";
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
          <h3 className="text-lg font-semibold text-dark">Recovery Opportunities</h3>
          <p className="text-sm text-muted">High-potential recovery candidates sorted by score</p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Revenue at Risk</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Failure Type</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Recovery Score</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Recommended Action</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {opportunities.map((opportunity) => (
                <tr key={opportunity.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-dark">{opportunity.customer_name}</p>
                      <p className="text-xs text-muted">Detected {format(new Date(opportunity.detected_at), "MMM d, yyyy")}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-dark">
                    {formatCurrency(opportunity.amount)}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted max-w-[200px] truncate" title={opportunity.failure_type}>
                    {opportunity.failure_type}
                  </td>
                  <td className="px-4 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${getScoreBg(opportunity.recovery_score)}`}>
                      <span className={`text-sm font-semibold ${getScoreColor(opportunity.recovery_score)}`}>
                        {opportunity.recovery_score}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted max-w-[250px] truncate" title={opportunity.recommended_action}>
                    {opportunity.recommended_action}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={statusVariant[opportunity.recovery_status] || "neutral"} size="sm">
                      {opportunity.recovery_status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    {opportunity.recovery_status === "pending" && (
                      <Button size="sm" onClick={() => onStartRecovery(opportunity)} aria-label={`Start recovery for ${opportunity.customer_name}`}>
                        Start Recovery
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
