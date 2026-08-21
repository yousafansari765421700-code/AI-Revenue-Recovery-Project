"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import Filters from "@/components/dashboard/failed-payments/Filters";
import FailedPaymentsTable from "@/components/dashboard/failed-payments/FailedPaymentsTable";
import FailedPaymentDetailModal from "@/components/dashboard/failed-payments/FailedPaymentDetailModal";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast/Toast";
import { getFailedPayments, getFailedPaymentById, startRecovery } from "@/lib/data/failed-payments/client";
import type { FailedPaymentListItem, FailedPaymentDetail } from "@/lib/data/failed-payments/client";

function FailedPaymentsTableSkeleton() {
  return (
    <Card padding="lg">
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function FailedPaymentsPage() {
  const [payments, setPayments] = useState<FailedPaymentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<FailedPaymentDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: "",
  });

  const fetchPayments = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await getFailedPayments(user.id, {
        ...filters,
        amountMin: filters.amountMin ? parseFloat(filters.amountMin) : undefined,
        amountMax: filters.amountMax ? parseFloat(filters.amountMax) : undefined,
      });
      setPayments(data);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filters, user]);

  const handleViewDetails = async (payment: FailedPaymentListItem) => {
    if (!user) return;

    try {
      const detail = await getFailedPaymentById(user.id, payment.id);
      setSelectedPayment(detail);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch payment details:", error);
    }
  };

  const handleStartRecovery = async () => {
    if (!selectedPayment || !user) return;

    setIsRecovering(true);
    try {
      await startRecovery(user.id, selectedPayment.id);
      addToast("success", "Recovery started successfully! A recovery action has been created.");
      setIsModalOpen(false);
      fetchPayments();
    } catch (error) {
      console.error("Failed to start recovery:", error);
      addToast("error", "Failed to start recovery. Please try again.");
    } finally {
      setIsRecovering(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      dateFrom: "",
      dateTo: "",
      amountMin: "",
      amountMax: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Failed Payments</h1>
          <p className="text-muted">Manage and recover failed payments</p>
        </div>
      </div>

      <Filters
        search={filters.search}
        setSearch={(value) => setFilters({ ...filters, search: value })}
        status={filters.status}
        setStatus={(value) => setFilters({ ...filters, status: value })}
        dateFrom={filters.dateFrom}
        setDateFrom={(value) => setFilters({ ...filters, dateFrom: value })}
        dateTo={filters.dateTo}
        setDateTo={(value) => setFilters({ ...filters, dateTo: value })}
        amountMin={filters.amountMin}
        setAmountMin={(value) => setFilters({ ...filters, amountMin: value })}
        amountMax={filters.amountMax}
        setAmountMax={(value) => setFilters({ ...filters, amountMax: value })}
        onReset={handleResetFilters}
      />

      {loading ? (
        <FailedPaymentsTableSkeleton />
      ) : (
        <FailedPaymentsTable
          payments={payments}
          onViewDetails={handleViewDetails}
          onStartRecovery={(payment) => {
            handleViewDetails(payment);
          }}
        />
      )}

      <FailedPaymentDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        payment={selectedPayment}
        onStartRecovery={handleStartRecovery}
        isRecovering={isRecovering}
      />
    </div>
  );
}
