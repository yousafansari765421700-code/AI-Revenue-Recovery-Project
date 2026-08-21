"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/toast/Toast";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { createOrder } from "@/lib/data/orders/client";
import { getStoreProducts } from "@/lib/data/store/client";

export default function CheckoutPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customer_name.trim()) newErrors.customer_name = "Full name is required";
    if (!formData.customer_email.trim()) newErrors.customer_email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) newErrors.customer_email = "Invalid email format";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) {
      addToast("error", "Your cart is empty");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const userId = user?.id || "public";

      const order = await createOrder(userId, {
        order_number: orderNumber,
        total_amount: totalAmount,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        shipping_address: `${formData.address}, ${formData.city}, ${formData.country}`,
        items: items.map((item) => ({
          product_id: item.product_id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.discount_price ?? item.price,
          subtotal: (item.discount_price ?? item.price) * item.quantity,
        })),
      });

      clearCart();
      addToast("success", "Order placed successfully!");
      router.push(`/store/order-success?orderNumber=${order.order_number}`);
    } catch (error) {
      console.error("Failed to create order:", error);
      addToast("error", "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-dark">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card padding="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-dark mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    error={errors.customer_name}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    error={errors.customer_email}
                    required
                  />
                  <Input
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-dark mb-4">Billing Information</h3>
                <div className="space-y-4">
                  <Input
                    label="Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    error={errors.address}
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      error={errors.city}
                      required
                    />
                    <Input
                      label="Country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      error={errors.country}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" isLoading={isSubmitting} className="w-full">
                Place Order
              </Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-dark mb-4">Order Summary</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product_id} className="flex items-center justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark truncate">{item.name}</p>
                    <p className="text-muted">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-dark ml-4">
                    ${((item.discount_price ?? item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-medium text-dark">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Discount</span>
                  <span className="font-medium text-success">$0.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-dark">Total</span>
                  <span className="text-xl font-bold text-dark">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
