"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState, useEffect } from "react";
import type { Product } from "@/lib/data/products/client";

interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  category: string;
  price: string;
  discount_price: string;
  stock_quantity: string;
  status: string;
  image_url: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  product?: Product | null;
  isLoading: boolean;
}

export default function ProductFormModal({ isOpen, onClose, onSubmit, product, isLoading }: ProductFormModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    sku: "",
    description: "",
    category: "",
    price: "",
    discount_price: "",
    stock_quantity: "",
    status: "active",
    image_url: "",
  });
  const [errors, setErrors] = useState<Partial<ProductFormData>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        description: product.description || "",
        category: product.category,
        price: product.price.toString(),
        discount_price: product.discount_price?.toString() || "",
        stock_quantity: product.stock_quantity.toString(),
        status: product.status,
        image_url: product.image_url || "",
      });
    } else {
      setFormData({
        name: "",
        sku: "",
        description: "",
        category: "",
        price: "",
        discount_price: "",
        stock_quantity: "",
        status: "active",
        image_url: "",
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const validate = (): boolean => {
    const newErrors: Partial<ProductFormData> = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (formData.price.trim() === "" || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = "Price must be a valid number >= 0";
    }
    if (formData.stock_quantity.trim() === "" || isNaN(Number(formData.stock_quantity)) || Number(formData.stock_quantity) < 0) {
      newErrors.stock_quantity = "Stock cannot be negative";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? "Edit Product" : "Add Product"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Product Name"
            type="text"
            placeholder="Enter product name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />
          <Input
            label="SKU"
            type="text"
            placeholder="e.g., PROD-001"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            error={errors.sku}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-1.5">Description</label>
          <textarea
            placeholder="Enter product description..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select category</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Home & Garden">Home & Garden</option>
              <option value="Sports">Sports</option>
              <option value="Books">Books</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && <p className="text-xs text-danger mt-1">{errors.category}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Price"
            type="number"
            placeholder="0.00"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            error={errors.price}
            required
          />
          <Input
            label="Discount Price (optional)"
            type="number"
            placeholder="0.00"
            value={formData.discount_price}
            onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Stock Quantity"
            type="number"
            placeholder="0"
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
            error={errors.stock_quantity}
            required
          />
          <Input
            label="Image URL (optional)"
            type="text"
            placeholder="https://example.com/image.jpg"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {product ? "Update Product" : "Add Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
