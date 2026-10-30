"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Truck,
  RotateCcw,
  CreditCard,
  Sparkles,
  Activity,
  ArrowRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import type {
  OrderRow,
  OrderStats,
  OrderStatusCount,
  OrderChartPoint,
  OrderActivity,
} from "@/app/dashboard/orders/page";

interface CustomerInsights {
  returningPct: number;
  firstTimePct: number;
  avgOrderValue: number;
  repeatPurchasePct: number;
  hasData: boolean;
}

interface AIInsights {
  hasData: boolean;
  total: number;
  pendingValue: number;
  completedValue: number;
}

interface OrderAlert {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
}

interface OrdersClientProps {
  orders: OrderRow[];
  stats: OrderStats;
  statusCounts: OrderStatusCount[];
  chartData: OrderChartPoint[];
  activities: OrderActivity[];
  alerts: OrderAlert[];
  customerInsights: CustomerInsights;
  insights: AIInsights;
}

const statusVariant: Record<OrderRow["status"], "warning" | "primary" | "success" | "danger" | "neutral"> = {
  pending: "warning",
  processing: "primary",
  confirmed: "primary",
  completed: "success",
  cancelled: "danger",
};

const statusIcon: Record<OrderRow["status"], any> = {
  pending: Clock,
  processing: Activity,
  confirmed: Truck,
  completed: CheckCircle2,
  cancelled: X,
};

const statusColorClass: Record<OrderRow["status"], string> = {
  pending: "warning",
  processing: "primary",
  confirmed: "secondary",
  completed: "success",
  cancelled: "danger",
};

const activityIcon: Record<OrderActivity["kind"], any> = {
  new: Package,
  processing: Activity,
  shipped: Truck,
  completed: CheckCircle2,
  cancelled: X,
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

export default function OrdersClient({
  orders,
  stats,
  statusCounts,
  chartData,
  activities,
  alerts,
  customerInsights,
  insights,
}: OrdersClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");

  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  const openOrderDetails = (order: OrderRow) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const isEmpty = orders.length === 0;

  if (isEmpty) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Orders</h1>
          <p className="text-muted">Monitor customer orders, fulfillment progress, and identify issues before they affect revenue.</p>
        </div>
        <Card padding="lg">
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center text-primary mx-auto mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-semibold text-dark mb-2">No orders yet</h2>
            <p className="text-muted mb-6">Orders placed by your customers will appear here.</p>
            <Link href="/store/products">
              <Button className="inline-flex items-center gap-2">
                Go to Storefront
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Orders</h1>
          <p className="text-muted">Monitor customer orders, fulfillment progress, and identify issues before they affect revenue.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-xl border border-border bg-white text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover padding="md">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <p className="text-2xl font-bold text-dark mb-1">{stats.total.toLocaleString()}</p>
          <p className="text-sm text-muted">Total Orders</p>
          <div className="mt-3 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line type="monotone" dataKey="orders" stroke="#6C63FF" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card hover padding="md">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-success-light flex items-center justify-center text-success">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-2xl font-bold text-dark mb-1">{stats.completed.toLocaleString()}</p>
          <p className="text-sm text-muted">Completed Orders</p>
          <div className="mt-3 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.map((c) => ({ ...c, v: c.orders }))}>
                <Line type="monotone" dataKey="v" stroke="#22C55E" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card hover padding="md">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-warning-light flex items-center justify-center text-warning">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-2xl font-bold text-dark mb-1">{stats.pending.toLocaleString()}</p>
          <p className="text-sm text-muted">Pending Orders</p>
          <div className="mt-3 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.map((c) => ({ ...c, v: c.orders }))}>
                <Line type="monotone" dataKey="v" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card hover padding="md">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-danger-light flex items-center justify-center text-danger">
              <X className="w-6 h-6" />
            </div>
          </div>
          <p className="text-2xl font-bold text-dark mb-1">{stats.cancelled.toLocaleString()}</p>
          <p className="text-sm text-muted">Cancelled Orders</p>
          <div className="mt-3 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.map((c) => ({ ...c, v: c.orders }))}>
                <Line type="monotone" dataKey="v" stroke="#EF4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Order Status Overview */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-dark mb-4">Order Status Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {statusCounts.map((item) => {
            const Icon = statusIcon[item.status as OrderRow["status"]] || Clock;
            const color = statusColorClass[item.status as OrderRow["status"]] || "neutral";
            return (
              <div key={item.status} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50/80 hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-lg bg-${color}-light flex items-center justify-center text-${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-dark">{item.count}</p>
                  <p className="text-xs text-muted capitalize">{item.status}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Order Analytics */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-dark">Order Analytics</h3>
            <p className="text-sm text-muted">Track order volume over time</p>
          </div>
          <div className="flex items-center gap-2">
            {["7d", "30d", "90d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range ? "bg-primary-light text-primary" : "text-muted hover:bg-gray-100"
                }`}
              >
                {range === "7d" ? "Day" : range === "30d" ? "Week" : "Month"}
              </button>
            ))}
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Line type="monotone" dataKey="orders" stroke="#6C63FF" strokeWidth={3} dot={{ fill: "#6C63FF", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Order Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-dark">Order Alerts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alerts.map((alert) => (
              <Card key={alert.id} hover padding="md">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      alert.priority === "high"
                        ? "bg-danger-light text-danger"
                        : alert.priority === "medium"
                        ? "bg-warning-light text-warning"
                        : "bg-gray-100 text-muted"
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-dark">{alert.title}</h4>
                    <p className="text-xs text-muted mt-1">{alert.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-medium text-primary">{alert.impact}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* AI Order Insights */}
      <Card padding="lg" className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-dark mb-1">AI Order Insights</h3>
            {insights.hasData ? (
              <div className="text-sm text-muted space-y-1">
                <p>
                  You have <span className="font-semibold text-dark">{stats.total}</span> real order
                  {stats.total === 1 ? "" : "s"} worth{" "}
                  <span className="font-semibold text-dark">
                    {formatCurrency(orders.reduce((s, o) => s + o.total, 0))}
                  </span>{" "}
                  in total.
                </p>
                {insights.pendingValue > 0 && (
                  <p>
                    <span className="font-semibold text-dark">
                      {formatCurrency(insights.pendingValue)}
                    </span>{" "}
                    is still pending confirmation.
                  </p>
                )}
                {insights.completedValue > 0 && (
                  <p>
                    <span className="font-semibold text-success">
                      {formatCurrency(insights.completedValue)}
                    </span>{" "}
                    has been completed.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted">
                No data yet. Once customers place orders, you will see AI-powered insights here.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-dark">Recent Orders</h3>
            <p className="text-sm text-muted">Manage and track all customer orders</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Products</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="text-sm font-medium text-dark hover:text-primary"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary text-xs font-medium">
                          {order.customerAvatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-dark">{order.customerName}</p>
                          <p className="text-xs text-muted">{order.customerEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted">{order.productCount}</td>
                    <td className="px-4 py-4 text-sm font-medium text-dark">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant[order.status]} size="sm">
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted">
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <Button variant="ghost" size="sm" aria-label={`View ${order.orderNumber}`}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <p className="text-sm text-muted">
            Showing {filteredOrders.length} of {orders.length} orders
          </p>
        </div>
      </Card>

      {/* Customer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-dark mb-4">Customer Insights</h3>
          {customerInsights.hasData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/80">
                <div>
                  <p className="text-sm text-muted">Returning Customers</p>
                  <p className="text-xl font-bold text-dark">{customerInsights.returningPct}%</p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">{customerInsights.returningPct}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/80">
                <div>
                  <p className="text-sm text-muted">First-time Buyers</p>
                  <p className="text-xl font-bold text-dark">{customerInsights.firstTimePct}%</p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-secondary flex items-center justify-center">
                  <span className="text-sm font-semibold text-secondary">{customerInsights.firstTimePct}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/80">
                <div>
                  <p className="text-sm text-muted">Avg. Order Value</p>
                  <p className="text-xl font-bold text-dark">{formatCurrency(customerInsights.avgOrderValue)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/80">
                <div>
                  <p className="text-sm text-muted">Repeat Purchase Rate</p>
                  <p className="text-xl font-bold text-dark">{customerInsights.repeatPurchasePct}%</p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-success flex items-center justify-center">
                  <span className="text-sm font-semibold text-success">{customerInsights.repeatPurchasePct}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-muted text-sm">No data yet</p>
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card padding="lg" className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-dark mb-4">Recent Order Activity</h3>
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = activityIcon[activity.kind];
                return (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark">{activity.action}</p>
                      <p className="text-xs text-muted">Order {activity.orderNumber}</p>
                    </div>
                    <span className="text-xs text-muted whitespace-nowrap">{activity.time}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-muted text-sm">No activity yet</p>
            </div>
          )}
        </Card>
      </div>

      {/* Order Details Drawer */}
      <Modal
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedOrder ? `Order ${selectedOrder.orderNumber}` : "Order Details"}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">
                Placed on {format(new Date(selectedOrder.createdAt), "MMMM d, yyyy 'at' h:mm a")}
              </p>
              <Badge variant={statusVariant[selectedOrder.status]} size="sm">
                {selectedOrder.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-dark mb-3">Customer Information</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted">Name:</span>{" "}
                    <span className="text-dark font-medium">{selectedOrder.customerName}</span>
                  </p>
                  <p>
                    <span className="text-muted">Email:</span>{" "}
                    <span className="text-dark">{selectedOrder.customerEmail}</span>
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-dark mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted">Products:</span>{" "}
                    <span className="text-dark font-medium">{selectedOrder.productCount}</span>
                  </p>
                  <p>
                    <span className="text-muted">Total:</span>{" "}
                    <span className="text-dark font-medium">{formatCurrency(selectedOrder.total)}</span>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-dark mb-3">Order Timeline</h4>
              <div className="space-y-3">
                {[
                  { status: "Order Placed", completed: true },
                  { status: "Confirmed", completed: ["confirmed", "processing", "completed"].includes(selectedOrder.status) },
                  { status: "Processing", completed: ["processing", "completed"].includes(selectedOrder.status) },
                  { status: "Completed", completed: selectedOrder.status === "completed" },
                  { status: "Cancelled", completed: selectedOrder.status === "cancelled" },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        step.completed ? "bg-success-light text-success" : "bg-gray-100 text-muted"
                      }`}
                    >
                      {step.completed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${step.completed ? "text-dark" : "text-muted"}`}>
                        {step.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
                Close
              </Button>
              <Link href={`/dashboard/orders/${selectedOrder.id}`}>
                <Button>View Full Order</Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
