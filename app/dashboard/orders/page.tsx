"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/toast/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { getOrders, updateOrderStatus, deleteOrder } from "@/lib/data/orders/client";
import type { Order } from "@/lib/data/orders/client";
import { format } from "date-fns";
import { Eye, Trash2 } from "lucide-react";
import Link from "next/link";

function OrdersSkeleton() {
  return (
    <Card padding="lg">
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getOrders(user.id);
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      addToast("error", "Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    if (!user) return;
    try {
      await updateOrderStatus(user.id, orderId, status);
      addToast("success", "Order status updated!");
      fetchOrders();
    } catch (error) {
      console.error("Failed to update order:", error);
      addToast("error", "Failed to update order status.");
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to delete order ${order.order_number}?`)) return;
    try {
      await deleteOrder(user.id, order.id);
      addToast("success", "Order deleted successfully!");
      fetchOrders();
    } catch (error) {
      console.error("Failed to delete order:", error);
      addToast("error", "Failed to delete order.");
    }
  };

  const statusVariant: Record<string, "success" | "warning" | "danger" | "neutral" | "primary"> = {
    pending: "warning",
    confirmed: "primary",
    processing: "primary",
    completed: "success",
    cancelled: "danger",
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark mb-2">Orders</h1>
        <p className="text-muted">Manage customer orders</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover padding="md">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            </div>
            <span className="text-sm font-medium text-muted">Total</span>
          </div>
          <p className="text-2xl font-bold text-dark">{totalOrders}</p>
          <p className="text-sm text-muted">Total Orders</p>
        </Card>
        <Card hover padding="md">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-warning-light flex items-center justify-center text-warning">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <span className="text-sm font-medium text-muted">Pending</span>
          </div>
          <p className="text-2xl font-bold text-dark">{pendingOrders}</p>
          <p className="text-sm text-muted">Pending Orders</p>
        </Card>
        <Card hover padding="md">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-success-light flex items-center justify-center text-success">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            </div>
            <span className="text-sm font-medium text-muted">Done</span>
          </div>
          <p className="text-2xl font-bold text-dark">{completedOrders}</p>
          <p className="text-sm text-muted">Completed Orders</p>
        </Card>
        <Card hover padding="md">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center text-accent">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <span className="text-sm font-medium text-muted">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-dark">${totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-muted">Total Store Revenue</p>
        </Card>
      </div>

      {loading ? (
        <OrdersSkeleton />
      ) : orders.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-12">
            <p className="text-muted text-lg">No orders yet</p>
            <p className="text-muted text-sm mt-2">Orders will appear here when customers place them</p>
          </div>
        </Card>
      ) : (
        <Card padding="lg">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4 text-sm font-medium text-dark">{order.order_number}</td>
                      <td className="px-4 py-4 text-sm text-muted">{order.customer_name}</td>
                      <td className="px-4 py-4 text-sm font-medium text-dark">${order.total_amount.toFixed(2)}</td>
                      <td className="px-4 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="text-sm rounded-lg border border-border bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted">
                        {format(new Date(order.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/orders/${order.id}`}>
                            <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteOrder(order)}>
                            <Trash2 className="w-4 h-4 text-danger" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
