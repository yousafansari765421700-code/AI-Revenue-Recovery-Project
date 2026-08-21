"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { useState, useEffect } from "react";
import type { Invoice } from "@/lib/data/invoices/client";

interface InvoiceFormData {
  customer_id: string;
  invoice_number: string;
  amount: string;
  currency: string;
  status: string;
  due_date: string;
}

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InvoiceFormData) => Promise<void>;
  invoice?: Invoice | null;
  isLoading: boolean;
  customers: { id: string; name: string }[];
}

export default function InvoiceFormModal({
  isOpen,
  onClose,
  onSubmit,
  invoice,
  isLoading,
  customers,
}: InvoiceFormModalProps) {
  const [formData, setFormData] = useState<InvoiceFormData>({
    customer_id: "",
    invoice_number: "",
    amount: "",
    currency: "USD",
    status: "pending",
    due_date: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof InvoiceFormData, string>>>({});

  useEffect(() => {
    if (invoice) {
      setFormData({
        customer_id: invoice.customer_id,
        invoice_number: invoice.invoice_number,
        amount: invoice.amount.toString(),
        currency: invoice.currency,
        status: invoice.status,
        due_date: invoice.due_date || "",
      });
    } else {
      setFormData({
        customer_id: customers[0]?.id || "",
        invoice_number: "",
        amount: "",
        currency: "USD",
        status: "pending",
        due_date: "",
      });
    }
    setErrors({});
  }, [invoice, isOpen, customers]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof InvoiceFormData, string>> = {};
    if (!formData.customer_id) newErrors.customer_id = "Customer is required";
    if (!formData.invoice_number.trim()) newErrors.invoice_number = "Invoice number is required";
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = "Valid amount is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={invoice ? "Edit Invoice" : "Create Invoice"} size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-dark mb-1.5">Customer</label>
          <select
            value={formData.customer_id}
            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.customer_id ? "border-danger" : "border-border bg-white"}`}
            required
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          {errors.customer_id && <p className="mt-1 text-sm text-danger">{errors.customer_id}</p>}
        </div>

        <Input
          label="Invoice Number"
          type="text"
          placeholder="INV-001"
          value={formData.invoice_number}
          onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
          error={errors.invoice_number}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount"
            type="number"
            placeholder="1000"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            error={errors.amount}
            required
          />
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <Input
            label="Due Date"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {invoice ? "Update Invoice" : "Create Invoice"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
