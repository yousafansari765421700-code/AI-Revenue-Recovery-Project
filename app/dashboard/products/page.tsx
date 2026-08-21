"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/toast/Toast";
import { useAuth } from "@/contexts/AuthContext";
import ProductsTable from "@/components/dashboard/products/ProductsTable";
import ProductFormModal from "@/components/dashboard/products/ProductFormModal";
import ProductDetailModal from "@/components/dashboard/products/ProductDetailModal";
import ProductsKPICards from "@/components/dashboard/products/ProductsKPICards";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/data/products/client";
import type { Product, ProductDetail } from "@/lib/data/products/client";

function ProductsTableSkeleton() {
  return (
    <Card padding="lg">
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
  const { user } = useAuth();
  const { addToast } = useToast();

  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    status: "all",
    sortBy: "newest",
  });

  const fetchProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getProducts(user.id, filters);
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters, user]);

  const handleAddProduct = async (data: any) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await createProduct(user.id, data);
      addToast("success", "Product created successfully!");
      setIsFormOpen(false);
      fetchProducts();
  } catch (error: any) {
  console.error("FAILED TO CREATE PRODUCT");
  console.error("Message:", error?.message);
  console.error("Details:", error?.details);
  console.error("Hint:", error?.hint);
  console.error("Code:", error?.code);
  console.error("Full error:", JSON.stringify(error, null, 2));

  addToast(
    "error",
    error?.message || "Failed to create product. Please try again."
  );
}finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (data: any) => {
    if (!user || !selectedProduct) return;
    setIsSubmitting(true);
    try {
      await updateProduct(user.id, selectedProduct.id, data);
      addToast("success", "Product updated successfully!");
      setIsFormOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Failed to update product:", error);
      addToast("error", "Failed to update product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to delete ${product.name}?`)) return;

    try {
      await deleteProduct(user.id, product.id);
      addToast("success", "Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      addToast("error", "Failed to delete product. Please try again.");
    }
  };

  const handleViewProduct = async (product: Product) => {
    if (!user) return;
    try {
      const { getProductById } = await import("@/lib/data/products/client");
      const detail = await getProductById(user.id, product.id);
      setProductDetail(detail);
      setIsDetailOpen(true);
    } catch (error) {
      console.error("Failed to fetch product details:", error);
    }
  };

  const handleSubmit = async (data: any) => {
    if (selectedProduct) {
      await handleEditProduct(data);
    } else {
      await handleAddProduct(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Products</h1>
          <p className="text-muted">Manage your product catalog</p>
        </div>
        <Button onClick={() => { setSelectedProduct(null); setIsFormOpen(true); }}>
          Add Product
        </Button>
      </div>

      <ProductsKPICards products={products} />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="px-4 py-2 rounded-xl border border-border bg-white text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Home & Garden">Home & Garden</option>
          <option value="Sports">Sports</option>
          <option value="Books">Books</option>
          <option value="Other">Other</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2 rounded-xl border border-border bg-white text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          className="px-4 py-2 rounded-xl border border-border bg-white text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
        </select>
      </div>

      {loading ? (
        <ProductsTableSkeleton />
      ) : (
        <ProductsTable
          products={products}
          onView={handleViewProduct}
          onEdit={(product) => { setSelectedProduct(product); setIsFormOpen(true); }}
          onDelete={handleDeleteProduct}
        />
      )}

      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedProduct(null); }}
        onSubmit={handleSubmit}
        product={selectedProduct}
        isLoading={isSubmitting}
      />

      <ProductDetailModal
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setProductDetail(null); }}
        product={productDetail}
      />
    </div>
  );
}
