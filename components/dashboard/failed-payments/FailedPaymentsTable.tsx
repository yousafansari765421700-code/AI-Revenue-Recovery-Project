"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";

interface FailedPayment {
  id: string;
  customer_name: string;
  customer_email: string;
  company: string | null;
  invoice_number: string;
  amount: number;
  currency: string;
  failure_reason: string | null;
  recovery_status: string;
  detected_at: string;
  recovery_potential: number;
}

interface FailedPaymentsTableProps {
  payments: FailedPayment[];
  onViewDetails: (payment: FailedPayment) => void;
  onStartRecovery: (payment: FailedPayment) => void;
}

const statusVariant: Record<string, "warning" | "primary" | "success" | "danger" | "neutral"> = {
  pending: "warning",
  in_progress: "primary",
  recovered: "success",
  failed: "danger",
};

export default function FailedPaymentsTable({ payments, onViewDetails, onStartRecovery }: FailedPaymentsTableProps) {
  const formatCurrency = (value: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatStatus = (status: string) => {
    return status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  if (payments.length === 0) {
    return (
      <Card padding="lg">
        <div className="text-center py-12">
          <p className="text-muted text-lg">No failed payments found</p>
          <p className="text-muted text-sm mt-2">Try adjusting your filters or search criteria</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Invoice</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Failure Reason</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Recovery Potential</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-dark">{payment.customer_name}</p>
                    <p className="text-xs text-muted">{payment.customer_email}</p>
                    {payment.company && <p className="text-xs text-muted">{payment.company}</p>}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-muted font-mono">{payment.invoice_number}</td>
                <td className="px-4 py-4 text-sm font-medium text-dark">
                  {formatCurrency(payment.amount, payment.currency)}
                </td>
                <td className="px-4 py-4 text-sm text-muted max-w-[200px] truncate" title={payment.failure_reason || "N/A"}>
                  {payment.failure_reason || "N/A"}
                </td>
                <td className="px-4 py-4 text-sm text-muted">
                  {format(new Date(payment.detected_at), "MMM d, yyyy")}
                </td>
                <td className="px-4 py-4">
                  <Badge variant={statusVariant[payment.recovery_status] || "neutral"} size="sm">
                    {formatStatus(payment.recovery_status)}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm font-medium text-dark">
                    {payment.recovery_potential > 0 ? formatCurrency(payment.recovery_potential, payment.currency) : "—"}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onViewDetails(payment)}>
                      View
                    </Button>
                    {payment.recovery_status === "pending" && (
                      <Button size="sm" onClick={() => onStartRecovery(payment)}>
                        Recover
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
