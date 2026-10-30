import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";
import { ShoppingCart, Package, Tag, Hash, FileText, Calendar, ChevronLeft, ImageOff } from "lucide-react";
import { getStoreProductById, getRelatedProducts } from "@/lib/data/store/server";
import ProductCard from "@/components/store/ProductCard";
import AddToCartButton from "@/components/store/AddToCartButton";
import { getProductImage } from "@/lib/data/products/image";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const product = await getStoreProductById(user.id, params.id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(user.id, product.category, product.id);
  const imageUrl = getProductImage(product);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isOutOfStock = product.stock_quantity <= 0 || product.status === "out_of_stock";

  return (
    <div className="space-y-8">
      <Link href="/store/products" className="inline-flex items-center gap-2 text-sm text-muted hover:text-dark">
        <ChevronLeft className="w-4 h-4" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-border p-8 flex items-center justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="w-full h-64 object-contain rounded-xl" />
          ) : (
            <div className="w-64 h-64 rounded-xl bg-primary-light flex items-center justify-center text-primary">
              <ImageOff className="w-24 h-24" />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-dark mb-2">{product.name}</h1>
            <p className="text-sm text-muted">SKU: {product.sku}</p>
            <div className="mt-3">
              <Badge variant={product.status === "active" ? "success" : "neutral"} size="sm">
                {product.status.replace("_", " ")}
              </Badge>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-dark">{formatCurrency(product.price)}</span>
            {product.discount_price && (
              <span className="text-xl text-muted line-through">{formatCurrency(product.discount_price)}</span>
            )}
          </div>

          <p className="text-muted">{product.description || "No description provided."}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-background rounded-xl">
              <p className="text-sm text-muted">Category</p>
              <p className="font-medium text-dark">{product.category}</p>
            </div>
            <div className="p-4 bg-background rounded-xl">
              <p className="text-sm text-muted">Stock</p>
              <p className="font-medium text-dark">{product.stock_quantity} units</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <AddToCartButton product={product} />
          </div>

          <div className="text-sm text-muted">
            Created {format(new Date(product.created_at), "MMM d, yyyy")}
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-dark mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
