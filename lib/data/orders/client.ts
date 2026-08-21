import { createClient } from "@/lib/supabase/browser";

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  total_amount: number;
  status: "pending" | "confirmed" | "processing" | "completed" | "cancelled";
  customer_name: string;
  customer_email: string;
  shipping_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
}

export async function getOrders(userId: string): Promise<Order[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!data) return [];

  return data.map((o: any) => ({
    id: o.id,
    user_id: o.user_id,
    order_number: o.order_number,
    total_amount: Number(o.total_amount),
    status: o.status,
    customer_name: o.customer_name,
    customer_email: o.customer_email,
    shipping_address: o.shipping_address,
    created_at: o.created_at,
    updated_at: o.updated_at,
  }));
}

export async function getOrderById(userId: string, id: string): Promise<OrderDetail | null> {
  const supabase = createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  return {
    id: order.id,
    user_id: order.user_id,
    order_number: order.order_number,
    total_amount: Number(order.total_amount),
    status: order.status,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    shipping_address: order.shipping_address,
    created_at: order.created_at,
    updated_at: order.updated_at,
    items: (items || []).map((item: any) => ({
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      subtotal: Number(item.subtotal),
      created_at: item.created_at,
    })),
  };
}

export async function createOrder(userId: string, data: {
  order_number: string;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  shipping_address?: string | null;
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[];
}) {
  const supabase = createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      order_number: data.order_number,
      total_amount: data.total_amount,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      shipping_address: data.shipping_address || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;

  const orderItems = data.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.subtotal,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;

  for (const item of data.items) {
    const { data: product } = await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", item.product_id)
      .single();

    if (product && typeof product.stock_quantity === 'number') {
      const newStock = Math.max(0, product.stock_quantity - item.quantity);
      await supabase
        .from("products")
        .update({ stock_quantity: newStock })
        .eq("id", item.product_id);
    }
  }

  return order;
}

export async function updateOrderStatus(userId: string, id: string, status: string) {
  const supabase = createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return order;
}

export async function deleteOrder(userId: string, id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}
