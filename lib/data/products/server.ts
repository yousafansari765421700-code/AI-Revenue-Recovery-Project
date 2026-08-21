import { createClient } from "@/lib/supabase/server";

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

export async function getProducts(
  userId: string,
  filters: {
    search?: string;
    category?: string;
    status?: string;
  } = {}
): Promise<Product[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
  }

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
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

export async function getProductById(userId: string, id: string): Promise<ProductDetail | null> {
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!product) return null;

  const { data: invoiceItems } = await supabase
    .from("invoice_items")
    .select("invoice_id")
    .eq("product_id", id);

  const invoiceCount = invoiceItems?.length || 0;

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
    invoice_count: invoiceCount,
  };
}

export async function createProduct(userId: string, data: {
  name: string;
  sku: string;
  description?: string;
  category: string;
  price: number;
  discount_price?: number | null;
  stock_quantity: number;
  status?: string;
  image_url?: string | null;
}) {
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      user_id: userId,
      name: data.name,
      sku: data.sku,
      description: data.description || null,
      category: data.category,
      price: data.price,
      discount_price: data.discount_price ?? null,
      stock_quantity: data.stock_quantity,
      status: data.status || "active",
      image_url: data.image_url || null,
      total_revenue: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return product;
}

export async function updateProduct(userId: string, id: string, data: {
  name?: string;
  sku?: string;
  description?: string;
  category?: string;
  price?: number;
  discount_price?: number | null;
  stock_quantity?: number;
  status?: string;
  image_url?: string | null;
}) {
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .update(data)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return product;
}

export async function deleteProduct(userId: string, id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}
