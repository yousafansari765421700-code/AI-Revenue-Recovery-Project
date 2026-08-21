"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Package, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";

interface ProductsKPICardsProps {
  products: any[];
}

export default function ProductsKPICards({ products }: ProductsKPICardsProps) {
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "active").length;
  const totalRevenue = products.reduce((sum, p) => sum + Number(p.total_revenue || 0), 0);
  const lowStockItems = products.filter((p) => Number(p.stock_quantity) < 10 && p.status !== "out_of_stock").length;

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
          <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary">
            <Package className="w-6 h-6" />
          </div>
          <Badge variant="primary" size="sm">Total</Badge>
        </div>
        <p className="text-2xl font-bold text-dark mb-1">{totalProducts}</p>
        <p className="text-sm text-muted">Total Products</p>
      </Card>

      <Card hover padding="md">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-success-light flex items-center justify-center text-success">
            <TrendingUp className="w-6 h-6" />
          </div>
          <Badge variant="success" size="sm">Active</Badge>
        </div>
        <p className="text-2xl font-bold text-dark mb-1">{activeProducts}</p>
        <p className="text-sm text-muted">Active Products</p>
      </Card>

      <Card hover padding="md">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center text-accent">
            <DollarSign className="w-6 h-6" />
          </div>
          <Badge variant="primary" size="sm">Revenue</Badge>
        </div>
        <p className="text-2xl font-bold text-dark mb-1">{formatCurrency(totalRevenue)}</p>
        <p className="text-sm text-muted">Total Product Revenue</p>
      </Card>

      <Card hover padding="md">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-warning-light flex items-center justify-center text-warning">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <Badge variant="warning" size="sm">Attention</Badge>
        </div>
        <p className="text-2xl font-bold text-dark mb-1">{lowStockItems}</p>
        <p className="text-sm text-muted">Low Stock Items</p>
      </Card>
    </div>
  );
}
