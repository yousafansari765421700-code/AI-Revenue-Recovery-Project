"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";
import { Eye, Edit, Trash2, ImageOff } from "lucide-react";
import type { Product } from "@/lib/data/products/client";
import { getProductImage } from "@/lib/data/products/image";

interface ProductsTableProps {
  products: Product[];
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const statusVariant: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  active: "success",
  inactive: "neutral",
  out_of_stock: "danger",
};

function ProductImage({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);
  const src = getProductImage(product);
  const showFallback = !src || imgError;

  const handleError = useCallback(() => {
    setImgError(true);
  }, []);

  if (showFallback) {
    return (
      <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary flex-shrink-0">
        <ImageOff className="w-5 h-5" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={product.name}
      className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
      onError={handleError}
    />
  );
}

export default function ProductsTable({ products, onView, onEdit, onDelete }: ProductsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (products.length === 0) {
    return (
      <Card padding="lg">
        <div className="text-center py-12">
          <p className="text-muted text-lg">No products found</p>
          <p className="text-muted text-sm mt-2">Get started by adding your first product</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Product</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">SKU</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Category</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Price</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Stock</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Created</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <ProductImage product={product} />
                      <div>
                        <p className="text-sm font-medium text-dark">{product.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">{product.sku}</td>
                  <td className="px-4 py-4 text-sm text-muted">{product.category}</td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-dark">
                      {formatCurrency(product.price)}
                      {product.discount_price && (
                        <span className="text-xs text-muted line-through ml-2">
                          {formatCurrency(product.discount_price)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">{product.stock_quantity}</td>
                  <td className="px-4 py-4">
                    <Badge variant={statusVariant[product.status] || "neutral"} size="sm">
                      {product.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">
                    {format(new Date(product.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onView(product)} aria-label={`View ${product.name}`}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(product)} aria-label={`Edit ${product.name}`}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(product)} aria-label={`Delete ${product.name}`}>
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
  );
}
