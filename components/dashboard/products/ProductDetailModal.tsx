"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";
import { DollarSign, Package, Tag, Hash, FileText, Calendar, Image as ImageIcon } from "lucide-react";
import type { ProductDetail } from "@/lib/data/products/client";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductDetail | null;
}

const statusVariant: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  active: "success",
  inactive: "neutral",
  out_of_stock: "danger",
};

export default function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  if (!product) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Details" size="lg">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-20 h-20 rounded-xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-primary-light flex items-center justify-center text-primary">
              <Package className="w-10 h-10" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-dark">{product.name}</h3>
            <p className="text-sm text-muted">SKU: {product.sku}</p>
            <div className="mt-2">
              <Badge variant={statusVariant[product.status] || "neutral"} size="sm">
                {product.status.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-dark mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Description
              </h4>
              <p className="text-sm text-muted">{product.description || "No description provided"}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-dark mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Category
              </h4>
              <p className="text-sm text-muted">{product.category}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-dark mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Stock
              </h4>
              <p className="text-sm text-muted">{product.stock_quantity} units</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-dark mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pricing
              </h4>
              <div className="space-y-1">
                <p className="text-sm"><span className="text-muted">Price:</span> <span className="text-dark font-medium">{formatCurrency(product.price)}</span></p>
                {product.discount_price && (
                  <p className="text-sm"><span className="text-muted">Discount Price:</span> <span className="text-dark font-medium">{formatCurrency(product.discount_price)}</span></p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-dark mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Revenue
              </h4>
              <p className="text-2xl font-bold text-success">{formatCurrency(product.total_revenue)}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-dark mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Dates
              </h4>
              <div className="space-y-1">
                <p className="text-sm"><span className="text-muted">Created:</span> <span className="text-dark">{format(new Date(product.created_at), "MMM d, yyyy")}</span></p>
                <p className="text-sm"><span className="text-muted">Updated:</span> <span className="text-dark">{format(new Date(product.updated_at), "MMM d, yyyy")}</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
