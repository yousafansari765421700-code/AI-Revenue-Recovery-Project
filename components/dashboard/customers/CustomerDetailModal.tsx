"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { User, Mail, Building, DollarSign, FileText, AlertTriangle, TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { CustomerDetail } from "@/lib/data/customers/client";

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerDetail | null;
}

const statusVariant: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  active: "success",
  inactive: "warning",
  churned: "danger",
};

export default function CustomerDetailModal({ isOpen, onClose, customer }: CustomerDetailModalProps) {
  if (!customer) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customer Details" size="lg">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-dark">{customer.name}</h3>
            <p className="text-muted">{customer.email}</p>
          </div>
          <Badge variant={statusVariant[customer.status] || "neutral"} size="md">
            {customer.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card padding="sm" className="text-center">
            <DollarSign className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-dark">{formatCurrency(customer.total_revenue)}</p>
            <p className="text-xs text-muted">Total Revenue</p>
          </Card>
          <Card padding="sm" className="text-center">
            <FileText className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-dark">{customer.paid_invoices}</p>
            <p className="text-xs text-muted">Paid Invoices</p>
          </Card>
          <Card padding="sm" className="text-center">
            <AlertTriangle className="w-6 h-6 text-danger mx-auto mb-2" />
            <p className="text-2xl font-bold text-dark">{customer.failed_payments}</p>
            <p className="text-xs text-muted">Failed Payments</p>
          </Card>
          <Card padding="sm" className="text-center">
            <TrendingUp className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-dark">{formatCurrency(customer.recovered_revenue)}</p>
            <p className="text-xs text-muted">Recovered Revenue</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-dark mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Customer Information
            </h4>
            <div className="space-y-2 pl-6">
              <p className="text-sm"><span className="text-muted">Name:</span> <span className="text-dark font-medium">{customer.name}</span></p>
              <p className="text-sm"><span className="text-muted">Email:</span> <span className="text-dark">{customer.email}</span></p>
              {customer.company && (
                <p className="text-sm"><span className="text-muted">Company:</span> <span className="text-dark">{customer.company}</span></p>
              )}
              <p className="text-sm"><span className="text-muted">Status:</span> <span className="text-dark capitalize">{customer.status}</span></p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-dark mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Timeline
            </h4>
            <div className="space-y-2 pl-6">
              <p className="text-sm"><span className="text-muted">Created:</span> <span className="text-dark">{format(new Date(customer.created_at), "MMM d, yyyy")}</span></p>
              <p className="text-sm"><span className="text-muted">Last Updated:</span> <span className="text-dark">{format(new Date(customer.updated_at), "MMM d, yyyy")}</span></p>
            </div>
          </div>
        </div>

        {customer.revenue_history.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-dark mb-3">Revenue History</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {customer.revenue_history.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background rounded-xl">
                  <span className="text-sm text-muted">{format(new Date(item.date), "MMM d, yyyy")}</span>
                  <span className="text-sm font-medium text-dark">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
