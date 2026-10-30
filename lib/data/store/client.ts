import { createClient } from "@/lib/supabase/browser";

export interface Product {
  id: string;
  user_id: string;
  name: string;
  sku: string;
  description: string | null;
  category: string;
  price: number;
  discount_price: number | null;
  stock_quantity: number;
  status: "active" | "inactive" | "out_of_stock";
  image_url: string | null;
  total_revenue: number;
  created_at: string;
  updated_at: string;
}

export interface ProductDetail extends Product {
  invoice_count?: number;
}

export async function getStoreProducts(userId: string, filters: {
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
} = {}): Promise<Product[]> {
  const supabase = createClient();

  let query = supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
  }

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters.sortBy === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (filters.sortBy === "price_desc") {
    query = query.order("price", { ascending: false });
  } else if (filters.sortBy === "name_asc") {
    query = query.order("name", { ascending: true });
  }

  const { data } = await query;

  if (!data) return [];

  return data.map((p: any) => ({
    id: p.id,
    user_id: p.user_id,
    name: p.name,
    sku: p.sku,
    description: p.description,
    category: p.category,
    price: Number(p.price),
    discount_price: p.discount_price ? Number(p.discount_price) : null,
    stock_quantity: Number(p.stock_quantity),
    status: p.status,
    image_url: p.image_url,
    total_revenue: Number(p.total_revenue),
    created_at: p.created_at,
    updated_at: p.updated_at,
  }));
}

export async function getStoreProductById(userId: string, id: string): Promise<ProductDetail | null> {
  const supabase = createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (!product) return null;

  return {
    id: product.id,
    user_id: product.user_id,
    name: product.name,
    sku: product.sku,
    description: product.description,
    category: product.category,
    price: Number(product.price),
    discount_price: product.discount_price ? Number(product.discount_price) : null,
    stock_quantity: Number(product.stock_quantity),
    status: product.status,
    image_url: product.image_url,
    total_revenue: Number(product.total_revenue),
    created_at: product.created_at,
    updated_at: product.updated_at,
  };
}

export async function getRelatedProducts(userId: string, category: string, excludeProductId: string): Promise<Product[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .eq("category", category)
    .neq("id", excludeProductId)
    .limit(4);

  if (!data) return [];

  return data.map((p: any) => ({
    id: p.id,
    user_id: p.user_id,
    name: p.name,
    sku: p.sku,
    description: p.description,
    category: p.category,
    price: Number(p.price),
    discount_price: p.discount_price ? Number(p.discount_price) : null,
    stock_quantity: Number(p.stock_quantity),
    status: p.status,
    image_url: p.image_url,
    total_revenue: Number(p.total_revenue),
    created_at: p.created_at,
    updated_at: p.updated_at,
  }));
}

export async function getStoreCategories(userId: string): Promise<string[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from("products")
    .select("category")
    .eq("user_id", userId)
    .eq("status", "active");

  if (!data) return [];

  const categories = Array.from(new Set(data.map((p: any) => p.category)));
  return categories.sort();
}
