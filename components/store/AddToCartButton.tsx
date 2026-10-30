"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/toast/Toast";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/data/products/client";

interface AddToCartButtonProps {
  product: Product;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  labelWhenInStock?: string;
}

export default function AddToCartButton({
  product,
  size = "lg",
  fullWidth = false,
  labelWhenInStock = "Add to Cart",
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const router = useRouter();

  const isOutOfStock =
    product.stock_quantity <= 0 || product.status === "out_of_stock";

  const handleClick = () => {
    if (isOutOfStock) {
      addToast("error", "This product is out of stock");
      return;
    }
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      discount_price: product.discount_price,
      image_url: product.image_url ?? null,
      stock_quantity: product.stock_quantity,
    });
    addToast("success", `${product.name} added to cart`);
  };

  return (
    <Button
      size={size}
      onClick={handleClick}
      disabled={isOutOfStock}
      className={`flex items-center gap-2 ${fullWidth ? "w-full" : ""}`}
    >
      <ShoppingCart className="w-5 h-5" />
      {isOutOfStock ? "Out of Stock" : labelWhenInStock}
    </Button>
  );
}
