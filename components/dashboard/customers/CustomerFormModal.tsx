"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { useState, useEffect } from "react";
import type { Customer } from "@/lib/data/customers/client";

interface CustomerFormData {
  name: string;
  email: string;
  company: string;
  status: string;
}

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  customer?: Customer | null;
  isLoading: boolean;
}

export default function CustomerFormModal({
  isOpen,
  onClose,
  onSubmit,
  customer,
  isLoading,
}: CustomerFormModalProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    email: "",
    company: "",
    status: "active",
  });
  const [errors, setErrors] = useState<Partial<CustomerFormData>>({});

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        company: customer.company || "",
        status: customer.status,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        company: "",
        status: "active",
      });
    }
    setErrors({});
  }, [customer, isOpen]);

  const validate = (): boolean => {
    const newErrors: Partial<CustomerFormData> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={customer ? "Edit Customer" : "Add Customer"} size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="john@company.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          required
        />
        <Input
          label="Company"
          type="text"
          placeholder="Acme Inc."
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
        <div>
          <label className="block text-sm font-medium text-dark mb-1.5">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="churned">Churned</option>
          </select>
        </div>
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {customer ? "Update Customer" : "Add Customer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
