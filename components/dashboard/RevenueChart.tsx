"use client";

import { Card } from "@/components/ui/Card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartData {
  date: string;
  totalRevenue: number;
  lostRevenue: number;
  recoveredRevenue: number;
}

interface RevenueChartProps {
  data: RevenueChartData[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-dark">Revenue Recovery</h3>
          <p className="text-sm text-muted">Monthly recovery performance</p>
        </div>
        <select className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option>Last 30 days</option>
          <option>Last 90 days</option>
          <option>Last year</option>
        </select>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value) => [formatCurrency(value as number), ""]}
            />
            <Legend />
            <Bar dataKey="totalRevenue" name="Total Revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            <Bar dataKey="lostRevenue" name="Lost Revenue" fill="#EF4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="recoveredRevenue" name="Recovered Revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
