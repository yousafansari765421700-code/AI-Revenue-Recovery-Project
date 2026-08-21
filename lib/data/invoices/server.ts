import { createClient } from "@/lib/supabase/server";

export interface Invoice {
  id: string;
  user_id: string;
  customer_id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue" | "failed";
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_email: string;
}

export async function getInvoices(
  userId: string,
  filters: {
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}
): Promise<Invoice[]> {
  const supabase = await createClient();

  let query = supabase
    .from("invoices")
    .select(`
      id,
      user_id,
      customer_id,
      invoice_number,
      amount,
      currency,
      status,
      due_date,
      paid_at,
      created_at,
      updated_at,
      customers(name, email)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.search) {
    query = query.or(`customers.name.ilike.%${filters.search}%,customers.email.ilike.%${filters.search}%,invoice_number.ilike.%${filters.search}%`);
  }

  if (filters.dateFrom) {
    query = query.gte("created_at", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("created_at", filters.dateTo);
  }

  const { data } = await query;

  if (!data) return [];

  return data.map((inv: any) => ({
    id: inv.id,
    user_id: inv.user_id,
    customer_id: inv.customer_id,
    invoice_number: inv.invoice_number,
    amount: Number(inv.amount),
    currency: inv.currency,
    status: inv.status,
    due_date: inv.due_date,
    paid_at: inv.paid_at,
    created_at: inv.created_at,
    updated_at: inv.updated_at,
    customer_name: inv.customers?.name || "Unknown",
    customer_email: inv.customers?.email || "",
  }));
}

export async function createInvoice(userId: string, data: {
  customer_id: string;
  invoice_number: string;
  amount: number;
  currency?: string;
  status?: string;
  due_date?: string;
}) {
  const supabase = await createClient();

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      user_id: userId,
      customer_id: data.customer_id,
      invoice_number: data.invoice_number,
      amount: data.amount,
      currency: data.currency || "USD",
      status: data.status || "pending",
      due_date: data.due_date || null,
    })
    .select()
    .single();

  if (error) throw error;
  return invoice;
}

export async function updateInvoice(userId: string, id: string, data: {
  customer_id?: string;
  invoice_number?: string;
  amount?: number;
  currency?: string;
  status?: string;
  due_date?: string;
  paid_at?: string;
}) {
  const supabase = await createClient();

  const { data: invoice, error } = await supabase
    .from("invoices")
    .update(data)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return invoice;
}

export async function deleteInvoice(userId: string, id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}
