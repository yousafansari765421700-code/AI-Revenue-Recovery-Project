"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import type { Invoice } from "@/lib/data/invoices/client";

interface InvoicesTableProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
}

const statusVariant: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  paid: "success",
  pending: "warning",
  overdue: "danger",
  failed: "danger",
};

export default function InvoicesTable({ invoices, onEdit, onDelete }: InvoicesTableProps) {
  const formatCurrency = (value: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (invoices.length === 0) {
    return (
      <Card padding="lg">
        <div className="text-center py-12">
          <p className="text-muted text-lg">No invoices found</p>
          <p className="text-muted text-sm mt-2">Try adjusting your filters or create a new invoice</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Invoice Number</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Due Date</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Created</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4 text-sm font-medium text-dark font-mono">{invoice.invoice_number}</td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-dark">{invoice.customer_name}</p>
                      <p className="text-xs text-muted">{invoice.customer_email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-dark">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">
                    {invoice.due_date ? format(new Date(invoice.due_date), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={statusVariant[invoice.status] || "neutral"} size="sm">
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">
                    {format(new Date(invoice.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(invoice)} aria-label={`Edit invoice ${invoice.invoice_number}`}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(invoice)} aria-label={`Delete invoice ${invoice.invoice_number}`} className="text-danger hover:text-danger">
                        Delete
                      </Button>
                    </div>
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
