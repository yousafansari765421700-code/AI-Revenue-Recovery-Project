"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";

interface Customer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company: string | null;
  total_revenue: number;
  status: "active" | "inactive" | "churned";
  created_at: string;
  updated_at: string;
}

interface CustomersTableProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const statusVariant: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  active: "success",
  inactive: "warning",
  churned: "danger",
};

export default function CustomersTable({ customers, onView, onEdit, onDelete }: CustomersTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (customers.length === 0) {
    return (
      <Card padding="lg">
        <div className="text-center py-12">
          <p className="text-muted text-lg">No customers found</p>
          <p className="text-muted text-sm mt-2">Try adjusting your search or filters</p>
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
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Email</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Company</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Total Revenue</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Created</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-dark">{customer.name}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">{customer.email}</td>
                  <td className="px-4 py-4 text-sm text-muted">{customer.company || "—"}</td>
                  <td className="px-4 py-4 text-sm font-medium text-dark">
                    {formatCurrency(customer.total_revenue)}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={statusVariant[customer.status] || "neutral"} size="sm">
                      {customer.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">
                    {format(new Date(customer.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onView(customer)} aria-label={`View ${customer.name}`}>
                        View
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(customer)} aria-label={`Edit ${customer.name}`}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(customer)} aria-label={`Delete ${customer.name}`} className="text-danger hover:text-danger">
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
