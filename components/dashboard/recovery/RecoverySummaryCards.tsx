"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DollarSign, TrendingUp, CheckCircle, BarChart3 } from "lucide-react";

interface RecoverySummary {
  revenueAtRisk: number;
  recoveryInProgress: number;
  successfullyRecovered: number;
  recoveryRate: number;
}

interface RecoverySummaryCardsProps {
  summary: RecoverySummary;
}

export default function RecoverySummaryCards({ summary }: RecoverySummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card hover padding="md">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-warning-light flex items-center justify-center text-warning">
            <DollarSign className="w-6 h-6" />
          </div>
          <Badge variant="warning" size="sm">Attention</Badge>
        </div>
        <p className="text-2xl font-bold text-dark mb-1">{formatCurrency(summary.revenueAtRisk)}</p>
        <p className="text-sm text-muted">Revenue at Risk</p>
      </Card>

      <Card hover padding="md">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary">
            <TrendingUp className="w-6 h-6" />
          </div>
          <Badge variant="primary" size="sm">Active</Badge>
        </div>
        <p className="text-2xl font-bold text-dark mb-1">{formatCurrency(summary.recoveryInProgress)}</p>
        <p className="text-sm text-muted">Recovery in Progress</p>
      </Card>

      <Card hover padding="md">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-success-light flex items-center justify-center text-success">
            <CheckCircle className="w-6 h-6" />
          </div>
          <Badge variant="success" size="sm">Completed</Badge>
        </div>
        <p className="text-2xl font-bold text-dark mb-1">{formatCurrency(summary.successfullyRecovered)}</p>
        <p className="text-sm text-muted">Successfully Recovered</p>
      </Card>

      <Card hover padding="md">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center text-accent">
              <BarChart3 className="w-6 h-6" />
            </div>
            <Badge variant="primary" size="sm">Rate</Badge>
          </div>
        <p className="text-2xl font-bold text-dark mb-1">{summary.recoveryRate.toFixed(1)}%</p>
        <p className="text-sm text-muted">Recovery Rate</p>
      </Card>
    </div>
  );
}
