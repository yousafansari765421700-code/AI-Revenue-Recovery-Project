import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { format } from "date-fns";
import { ChevronLeft, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getOrderById } from "@/lib/data/orders/server";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const order = await getOrderById(user.id, params.id);

  if (!order) {
    notFound();
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const statusVariant: Record<string, "success" | "warning" | "danger" | "neutral" | "primary"> = {
    pending: "warning",
    confirmed: "primary",
    processing: "primary",
    completed: "success",
    cancelled: "danger",
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard/orders" className="inline-flex items-center gap-2 text-sm text-muted hover:text-dark">
        <ChevronLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">Order {order.order_number}</h1>
          <p className="text-muted">Placed on {format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-dark mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-background rounded-xl">
                  <div>
                    <p className="font-medium text-dark">{item.product_name}</p>
                    <p className="text-sm text-muted">Qty: {item.quantity} x ${item.unit_price.toFixed(2)}</p>
                  </div>
                  <p className="font-medium text-dark">${item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-dark mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium text-dark">${order.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-dark">Total</span>
                <span className="text-xl font-bold text-dark">${order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="text-lg font-semibold text-dark mb-4">Customer</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted">Name:</span> <span className="text-dark font-medium">{order.customer_name}</span></p>
              <p><span className="text-muted">Email:</span> <span className="text-dark">{order.customer_email}</span></p>
              {order.shipping_address && (
                <p><span className="text-muted">Address:</span> <span className="text-dark">{order.shipping_address}</span></p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
