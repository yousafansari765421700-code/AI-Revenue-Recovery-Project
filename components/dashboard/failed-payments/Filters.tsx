"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface FiltersProps {
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  dateFrom: string;
  setDateFrom: (value: string) => void;
  dateTo: string;
  setDateTo: (value: string) => void;
  amountMin: string;
  setAmountMin: (value: string) => void;
  amountMax: string;
  setAmountMax: (value: string) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "recovered", label: "Recovered" },
  { value: "failed", label: "Failed" },
];

export default function Filters({
  search,
  setSearch,
  status,
  setStatus,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  amountMin,
  setAmountMin,
  amountMax,
  setAmountMax,
  onReset,
}: FiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input
              placeholder="Search customers, invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 rounded-xl border border-border bg-white text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </div>

      {showAdvanced && (
        <div className="p-4 bg-white rounded-xl border border-border space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Min Amount ($)</label>
              <input
                type="number"
                placeholder="0"
                value={amountMin}
                onChange={(e) => setAmountMin(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">Max Amount ($)</label>
              <input
                type="number"
                placeholder="Any"
                value={amountMax}
                onChange={(e) => setAmountMax(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={onReset} className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Reset Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
