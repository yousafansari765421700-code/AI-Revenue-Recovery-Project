"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/toast/Toast";
import { useAuth } from "@/contexts/AuthContext";
import CustomersTable from "@/components/dashboard/customers/CustomersTable";
import CustomerFormModal from "@/components/dashboard/customers/CustomerFormModal";
import CustomerDetailModal from "@/components/dashboard/customers/CustomerDetailModal";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "@/lib/data/customers/client";
import type { Customer, CustomerDetail } from "@/lib/data/customers/client";

function CustomersTableSkeleton() {
  return (
    <Card padding="lg">
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null);
  const { user } = useAuth();
  const { addToast } = useToast();

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
  });

  const fetchCustomers = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getCustomers(user.id, filters);
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [filters, user]);

  const handleAddCustomer = async (data: { name: string; email: string; company?: string; status?: string }) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await createCustomer(user.id, data);
      addToast("success", "Customer created successfully!");
      setIsFormOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error("Failed to create customer:", error);
      addToast("error", "Failed to create customer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCustomer = async (data: { name: string; email: string; company?: string; status?: string }) => {
    if (!user || !selectedCustomer) return;
    setIsSubmitting(true);
    try {
      await updateCustomer(user.id, selectedCustomer.id, data);
      addToast("success", "Customer updated successfully!");
      setIsFormOpen(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (error) {
      console.error("Failed to update customer:", error);
      addToast("error", "Failed to update customer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to delete ${customer.name}?`)) return;

    try {
      await deleteCustomer(user.id, customer.id);
      addToast("success", "Customer deleted successfully!");
      fetchCustomers();
    } catch (error) {
      console.error("Failed to delete customer:", error);
      addToast("error", "Failed to delete customer. Please try again.");
    }
  };

  const handleViewCustomer = async (customer: Customer) => {
    if (!user) return;
    try {
      const { getCustomerById } = await import("@/lib/data/customers/client");
      const customerDetail = await getCustomerById(user.id, customer.id);
      setCustomerDetail(customerDetail);
      setIsDetailOpen(true);
    } catch (error) {
      console.error("Failed to fetch customer details:", error);
    }
  };

  const handleSubmit = async (data: { name: string; email: string; company?: string; status?: string }) => {
    if (selectedCustomer) {
      await handleEditCustomer(data);
    } else {
      await handleAddCustomer(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Customers</h1>
          <p className="text-muted">Manage your customer base</p>
        </div>
        <Button onClick={() => { setSelectedCustomer(null); setIsFormOpen(true); }}>
          Add Customer
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search customers..."
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="churned">Churned</option>
        </select>
      </div>

      {loading ? (
        <CustomersTableSkeleton />
      ) : (
        <CustomersTable
          customers={customers}
          onView={handleViewCustomer}
          onEdit={(customer) => { setSelectedCustomer(customer); setIsFormOpen(true); }}
          onDelete={handleDeleteCustomer}
        />
      )}

      <CustomerFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedCustomer(null); }}
        onSubmit={handleSubmit}
        customer={selectedCustomer}
        isLoading={isSubmitting}
      />

      <CustomerDetailModal
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setCustomerDetail(null); }}
        customer={customerDetail}
      />
    </div>
  );
}
