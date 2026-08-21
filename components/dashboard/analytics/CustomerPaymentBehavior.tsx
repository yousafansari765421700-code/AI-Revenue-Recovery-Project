"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface CustomerPaymentBehavior {
  customer_name: string;
  total_invoices: number;
  paid_invoices: number;
  failed_invoices: number;
  payment_rate: number;
}

interface CustomerPaymentBehaviorProps {
  data: CustomerPaymentBehavior[];
}

export default function CustomerPaymentBehavior({ data }: CustomerPaymentBehaviorProps) {
  const getPaymentRateColor = (rate: number) => {
    if (rate >= 80) return "text-success";
    if (rate >= 50) return "text-warning";
    return "text-danger";
  };

  const getPaymentRateBgClass = (rate: number) => {
    if (rate >= 80) return "bg-success";
    if (rate >= 50) return "bg-warning";
    return "bg-danger";
  };

  if (data.length === 0) {
    return (
      <Card padding="lg">
        <div className="text-center py-12">
          <p className="text-muted text-lg">No customer payment data available</p>
          <p className="text-muted text-sm mt-2">Add customers and invoices to see payment behavior analysis</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-dark">Customer Payment Behavior</h3>
        <p className="text-sm text-muted">Payment success rates by customer</p>
      </div>

      <div className="space-y-4">
        {data.map((customer) => (
          <div key={customer.customer_name} className="flex items-center justify-between p-4 rounded-xl bg-background hover:bg-white border border-border hover:border-primary/20 transition-all duration-200">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-dark mb-1">{customer.customer_name}</p>
              <div className="flex items-center gap-4 text-sm text-muted">
                <span>{customer.total_invoices} invoices</span>
                <span className="text-success">{customer.paid_invoices} paid</span>
                {customer.failed_invoices > 0 && (
                  <span className="text-danger">{customer.failed_invoices} failed</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 ml-4">
              <div className="w-32">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted">Payment Rate</span>
                  <span className={`text-xs font-semibold ${getPaymentRateColor(customer.payment_rate)}`}>
                    {customer.payment_rate.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getPaymentRateBgClass(customer.payment_rate)}`}
                    style={{ width: `${customer.payment_rate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
