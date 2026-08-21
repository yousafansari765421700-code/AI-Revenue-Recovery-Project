"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast/Toast";
import { useCart } from "@/contexts/CartContext";
import { format } from "date-fns";
import { Trash2, Plus, Minus, ShoppingBag, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCart();
  const { addToast } = useToast();

  const handleCheckout = () => {
    if (items.length === 0) {
      addToast("error", "Your cart is empty");
      return;
    }
    window.location.href = "/store/checkout";
  };

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-dark">Shopping Cart</h1>
        <Card padding="lg">
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-muted text-lg mb-4">Your cart is empty</p>
            <Link href="/store/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-dark">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.product_id} padding="md">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary-light flex items-center justify-center text-primary flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <ShoppingBag className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-dark truncate">{item.name}</h3>
                  <p className="text-sm text-muted">${(item.discount_price ?? item.price).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="p-1 rounded-lg hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="p-1 rounded-lg hover:bg-gray-100"
                    disabled={item.quantity >= item.stock_quantity}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-medium text-dark w-24 text-right">
                  ${((item.discount_price ?? item.price) * item.quantity).toFixed(2)}
                </p>
                <button
                  onClick={() => removeItem(item.product_id)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-danger"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-dark mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium text-dark">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Discount</span>
                <span className="font-medium text-success">$0.00</span>
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <span className="font-semibold text-dark">Total</span>
                <span className="text-xl font-bold text-dark">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <Button onClick={handleCheckout} className="w-full">
                Proceed to Checkout
              </Button>
              <Link href="/store/products">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
