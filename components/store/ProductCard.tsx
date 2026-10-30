"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";
import { ShoppingCart, Package, ImageOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/toast/Toast";
import type { Product } from "@/lib/data/products/client";
import { getProductImage, getProductFallbackImage } from "@/lib/data/products/image";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { addToast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isOutOfStock = product.stock_quantity <= 0 || product.status === "out_of_stock";
  const imageUrl = getProductImage(product);

  const handleAddToCart = () => {
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

  const handleViewDetails = () => {
    router.push(`/store/products/${product.id}`);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const fallback = getProductFallbackImage(product);
    if (target.src !== window.location.origin + fallback) {
      target.src = fallback;
    } else {
      target.style.display = "none";
      target.parentElement?.classList.add("fallback-shown");
    }
  };

  return (
    <Card hover padding="lg">
      <div className="space-y-4">
        <div
          className="aspect-square rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={handleViewDetails}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted">
              <ImageOff className="w-10 h-10" />
              <span className="text-xs">No image</span>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs text-muted uppercase tracking-wider mb-1">{product.category}</p>
          <h3 className="font-semibold text-dark mb-1 cursor-pointer hover:text-primary" onClick={handleViewDetails}>
            {product.name}
          </h3>
          <p className="text-sm text-muted line-clamp-2">{product.description || ""}</p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-dark">{formatCurrency(product.price)}</span>
          {product.discount_price && (
            <span className="text-sm text-muted line-through">{formatCurrency(product.discount_price)}</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Badge variant={product.status === "active" ? "success" : "neutral"} size="sm">
            {product.status.replace("_", " ")}
          </Badge>
          <span className="text-xs text-muted">{product.stock_quantity} in stock</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleViewDetails} className="flex-1">
            View Details
          </Button>
          <Button size="sm" onClick={handleAddToCart} disabled={isOutOfStock} className="flex items-center gap-1">
            <ShoppingCart className="w-4 h-4" />
            {isOutOfStock ? "Sold Out" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
