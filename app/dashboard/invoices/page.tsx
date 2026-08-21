"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/toast/Toast";
import { useAuth } from "@/contexts/AuthContext";
import InvoicesTable from "@/components/dashboard/invoices/InvoicesTable";
import InvoiceFormModal from "@/components/dashboard/invoices/InvoiceFormModal";
import { getInvoices, createInvoice, updateInvoice, deleteInvoice } from "@/lib/data/invoices/client";
import { getCustomers } from "@/lib/data/customers/client";
import type { Invoice } from "@/lib/data/invoices/client";

function InvoicesTableSkeleton() {
  return (
    <Card padding="lg">
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { user } = useAuth();
  const { addToast } = useToast();

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    dateFrom: "",
    dateTo: "",
  });

  const fetchInvoices = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getInvoices(user.id, filters);
      setInvoices(data);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    if (!user) return;
    try {
      const { getCustomers } = await import("@/lib/data/customers/client");
      const data = await getCustomers(user.id);
      setCustomers(data.map((c) => ({ id: c.id, name: c.name })));
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [filters, user]);

  useEffect(() => {
    fetchCustomers();
  }, [user]);

  const handleAddInvoice = async (data: {
    customer_id: string;
    invoice_number: string;
    amount: string;
    currency?: string;
    status?: string;
    due_date: string;
  }) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await createInvoice(user.id, {
        customer_id: data.customer_id,
        invoice_number: data.invoice_number,
        amount: parseFloat(data.amount),
        currency: data.currency,
        status: data.status as any,
        due_date: data.due_date || undefined,
      });
      addToast("success", "Invoice created successfully!");
      setIsFormOpen(false);
      fetchInvoices();
    } catch (error) {
      console.error("Failed to create invoice:", error);
      addToast("error", "Failed to create invoice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInvoice = async (data: {
    customer_id: string;
    invoice_number: string;
    amount: string;
    currency?: string;
    status?: string;
    due_date: string;
  }) => {
    if (!user || !selectedInvoice) return;
    setIsSubmitting(true);
    try {
      const updateData: any = {
        customer_id: data.customer_id,
        invoice_number: data.invoice_number,
        amount: parseFloat(data.amount),
        currency: data.currency,
        status: data.status,
        due_date: data.due_date || null,
      };

      if (data.status === "paid" && !selectedInvoice.paid_at) {
        updateData.paid_at = new Date().toISOString();
      }

      await updateInvoice(user.id, selectedInvoice.id, updateData);
      addToast("success", "Invoice updated successfully!");
      setIsFormOpen(false);
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (error) {
      console.error("Failed to update invoice:", error);
      addToast("error", "Failed to update invoice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to delete invoice ${invoice.invoice_number}?`)) return;

    try {
      await deleteInvoice(user.id, invoice.id);
      addToast("success", "Invoice deleted successfully!");
      fetchInvoices();
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      addToast("error", "Failed to delete invoice. Please try again.");
    }
  };

  const handleSubmit = async (data: {
    customer_id: string;
    invoice_number: string;
    amount: string;
    currency?: string;
    status?: string;
    due_date: string;
  }) => {
    if (selectedInvoice) {
      await handleEditInvoice(data);
    } else {
      await handleAddInvoice(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Invoices</h1>
          <p className="text-muted">Manage your invoices and track payments</p>
        </div>
        <Button onClick={() => { setSelectedInvoice(null); setIsFormOpen(true); }}>
          Create Invoice
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search invoices..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2 rounded-xl border border-border bg-white text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {loading ? (
        <InvoicesTableSkeleton />
      ) : (
        <InvoicesTable
          invoices={invoices}
          onEdit={(invoice) => { setSelectedInvoice(invoice); setIsFormOpen(true); }}
          onDelete={handleDeleteInvoice}
        />
      )}

      <InvoiceFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedInvoice(null); }}
        onSubmit={handleSubmit}
        invoice={selectedInvoice}
        isLoading={isSubmitting}
        customers={customers}
      />
    </div>
  );
}
