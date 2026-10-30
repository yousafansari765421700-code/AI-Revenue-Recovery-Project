import { createClient } from "@/lib/supabase/server";
import { getOrders } from "@/lib/data/orders/server";
import { format, subDays, startOfDay } from "date-fns";
import OrdersClient from "@/components/dashboard/orders/OrdersClient";

export const dynamic = "force-dynamic";

export interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerAvatar: string;
  productCount: number;
  total: number;
  status: "pending" | "confirmed" | "processing" | "completed" | "cancelled";
  createdAt: string;
}

export interface OrderStats {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

export interface OrderChartPoint {
  name: string;
  orders: number;
}

export interface OrderActivity {
  id: string;
  action: string;
  orderNumber: string;
  time: string;
  kind: "new" | "completed" | "cancelled" | "shipped" | "processing";
}

async function fetchProductCounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderIds: string[]
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (orderIds.length === 0) return map;
  const { data } = await supabase
    .from("order_items")
    .select("order_id")
    .in("order_id", orderIds);
  if (!data) return map;
  for (const row of data as Array<{ order_id: string }>) {
    map.set(row.order_id, (map.get(row.order_id) || 0) + 1);
  }
  return map;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-dark">Orders</h1>
        <p className="text-muted">Please sign in to view your orders.</p>
      </div>
    );
  }

  const rawOrders = await getOrders(user.id);
  const productCounts = await fetchProductCounts(
    supabase,
    rawOrders.map((o) => o.id)
  );

  const orders: OrderRow[] = rawOrders.map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    customerName: o.customer_name,
    customerEmail: o.customer_email,
    customerAvatar: initials(o.customer_name),
    productCount: productCounts.get(o.id) ?? 0,
    total: o.total_amount,
    status: o.status,
    createdAt: o.created_at,
  }));

  const stats: OrderStats = {
    total: orders.length,
    completed: orders.filter((o) => o.status === "completed").length,
    pending: orders.filter((o) => o.status === "pending").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const statusOrder = ["pending", "processing", "confirmed", "completed", "cancelled"];
  const statusCounts: OrderStatusCount[] = statusOrder.map((s) => ({
    status: s,
    count: orders.filter((o) => o.status === s).length,
  }));

  const days = 7;
  const chartData: OrderChartPoint[] = Array.from({ length: days }).map((_, idx) => {
    const day = startOfDay(subDays(new Date(), days - 1 - idx));
    const next = startOfDay(subDays(new Date(), days - 2 - idx));
    const count = orders.filter((o) => {
      const created = new Date(o.createdAt);
      return created >= day && created < next;
    }).length;
    return { name: format(day, "EEE"), orders: count };
  });

  const recent = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const activities: OrderActivity[] = recent.map((o) => {
    const created = new Date(o.createdAt);
    const diffMin = Math.max(1, Math.floor((Date.now() - created.getTime()) / 60000));
    let time = `${diffMin} min ago`;
    if (diffMin >= 60) {
      const h = Math.floor(diffMin / 60);
      time = `${h} hour${h > 1 ? "s" : ""} ago`;
    }
    if (diffMin >= 60 * 24) {
      const d = Math.floor(diffMin / (60 * 24));
      time = `${d} day${d > 1 ? "s" : ""} ago`;
    }
    const kind: OrderActivity["kind"] =
      o.status === "completed"
        ? "completed"
        : o.status === "cancelled"
        ? "cancelled"
        : o.status === "confirmed"
        ? "shipped"
        : o.status === "processing"
        ? "processing"
        : "new";
    const actionLabel =
      kind === "completed"
        ? "Order completed"
        : kind === "cancelled"
        ? "Order cancelled"
        : kind === "shipped"
        ? "Order confirmed"
        : kind === "processing"
        ? "Order processing"
        : "New order received";
    return {
      id: o.id,
      action: actionLabel,
      orderNumber: o.orderNumber,
      time,
      kind,
    };
  });

  const highValuePending = orders
    .filter((o) => o.status === "pending" && o.total > 0)
    .sort((a, b) => b.total - a.total)[0];

  const recentFailed = orders
    .filter((o) => o.status === "cancelled")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const alerts: Array<{
    id: string;
    priority: "high" | "medium" | "low";
    title: string;
    description: string;
    impact: string;
  }> = [];

  if (highValuePending) {
    alerts.push({
      id: `pending-${highValuePending.id}`,
      priority: "high",
      title: "High-value order pending",
      description: `Order ${highValuePending.orderNumber} ($${highValuePending.total.toFixed(2)}) is awaiting confirmation.`,
      impact: `$${highValuePending.total.toFixed(2)} pending`,
    });
  }

  if (recentFailed.length >= 3) {
    const total = recentFailed.reduce((s, o) => s + o.total, 0);
    alerts.push({
      id: "cancelled-cluster",
      priority: "medium",
      title: "Multiple cancelled orders",
      description: `${recentFailed.length} orders were cancelled recently.`,
      impact: `$${total.toFixed(2)} cancelled`,
    });
  } else if (recentFailed.length > 0) {
    alerts.push({
      id: "cancelled-any",
      priority: "low",
      title: "Cancelled order detected",
      description: `Order ${recentFailed[0].orderNumber} was cancelled.`,
      impact: `$${recentFailed[0].total.toFixed(2)} cancelled`,
    });
  }

  const uniqueCustomers = new Set(orders.map((o) => o.customerEmail.toLowerCase())).size;
  const returningEmails = new Map<string, number>();
  for (const o of orders) {
    const k = o.customerEmail.toLowerCase();
    returningEmails.set(k, (returningEmails.get(k) || 0) + 1);
  }
  const repeatBuyers = Array.from(returningEmails.values()).filter((n) => n > 1).length;
  const firstTimeBuyers = Math.max(0, uniqueCustomers - repeatBuyers);
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const returningPct = uniqueCustomers > 0 ? Math.round((repeatBuyers / uniqueCustomers) * 100) : 0;
  const firstTimePct = uniqueCustomers > 0 ? 100 - returningPct : 0;
  const repeatPurchasePct =
    orders.length > 0 ? Math.round((repeatBuyers / orders.length) * 100) : 0;

  const customerInsights = {
    returningPct,
    firstTimePct,
    avgOrderValue,
    repeatPurchasePct,
    hasData: orders.length > 0,
  };

  const insights = {
    hasData: orders.length > 0,
    total: orders.length,
    pendingValue: orders.filter((o) => o.status === "pending").reduce((s, o) => s + o.total, 0),
    completedValue: orders.filter((o) => o.status === "completed").reduce((s, o) => s + o.total, 0),
  };

  return (
    <OrdersClient
      orders={orders}
      stats={stats}
      statusCounts={statusCounts}
      chartData={chartData}
      activities={activities}
      alerts={alerts}
      customerInsights={customerInsights}
      insights={insights}
    />
  );
}
