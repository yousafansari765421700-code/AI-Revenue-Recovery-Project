"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";

interface FailedPayment {
  id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  failure_reason: string | null;
  recovery_status: string;
  detected_at: string;
  invoice_number: string;
}

interface FailedPaymentsTableProps {
  payments: FailedPayment[];
}

const statusVariant: Record<string, "warning" | "primary" | "success" | "danger" | "neutral"> = {
  pending: "warning",
  in_progress: "primary",
  recovered: "success",
  failed: "danger",
};

export default function FailedPaymentsTable({ payments }: FailedPaymentsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-dark">Recent Failed Payments</h3>
          <p className="text-sm text-muted">Latest payment failures requiring attention</p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Invoice</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Failure Reason</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Date</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-dark">{payment.customer_name}</p>
                      <p className="text-xs text-muted">{payment.customer_email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted font-mono">{payment.invoice_number}</td>
                  <td className="px-4 py-4 text-sm font-medium text-dark">{formatCurrency(payment.amount)}</td>
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
                    <Button variant="ghost" size="sm" aria-label={`Recover payment for ${payment.customer_name}`}>
                      Recover
                    </Button>
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
