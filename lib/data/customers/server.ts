import { createClient } from "@/lib/supabase/server";

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company: string | null;
  total_revenue: number;
  status: "active" | "inactive" | "churned";
  created_at: string;
  updated_at: string;
}

export interface CustomerDetail extends Customer {
  paid_invoices: number;
  failed_payments: number;
  recovered_revenue: number;
  revenue_history: {
    date: string;
    amount: number;
  }[];
}

export async function getCustomers(
  userId: string,
  filters: {
    search?: string;
    status?: string;
  } = {}
): Promise<Customer[]> {
  const supabase = await createClient();

  let query = supabase
    .from("customers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
  }

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data } = await query;

  if (!data) return [];

  return data.map((c: any) => ({
    id: c.id,
    user_id: c.user_id,
    name: c.name,
    email: c.email,
    company: c.company,
    total_revenue: Number(c.total_revenue),
    status: c.status,
    created_at: c.created_at,
    updated_at: c.updated_at,
  }));
}

export async function getCustomerById(userId: string, id: string): Promise<CustomerDetail | null> {
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!customer) return null;

  const { data: invoices } = await supabase
    .from("invoices")
    .select("amount, status, created_at")
    .eq("customer_id", id)
    .eq("user_id", userId);

  const paidInvoices = invoices?.filter((inv) => inv.status === "paid") || [];
  const failedPayments = invoices?.filter((inv) => inv.status === "failed" || inv.status === "overdue") || [];

  const paidRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

  const { data: failedPaymentsData } = await supabase
    .from("failed_payments")
    .select("amount, recovery_status, detected_at")
    .eq("customer_id", id)
    .eq("user_id", userId);

  const recoveredRevenue = failedPaymentsData
    ?.filter((fp) => fp.recovery_status === "recovered")
    .reduce((sum, fp) => sum + Number(fp.amount), 0) || 0;

  const revenueHistory = invoices
    ?.filter((inv) => inv.status === "paid")
    .map((inv) => ({
      date: inv.created_at,
      amount: Number(inv.amount),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

  return {
    id: customer.id,
    user_id: customer.user_id,
    name: customer.name,
    email: customer.email,
    company: customer.company,
    total_revenue: Number(customer.total_revenue),
    status: customer.status,
    created_at: customer.created_at,
    updated_at: customer.updated_at,
    paid_invoices: paidInvoices.length,
    failed_payments: failedPayments.length,
    recovered_revenue: recoveredRevenue,
    revenue_history: revenueHistory,
  };
}

export async function createCustomer(userId: string, data: {
  name: string;
  email: string;
  company?: string;
  status?: string;
}) {
  const supabase = await createClient();

  const { data: customer, error } = await supabase
    .from("customers")
    .insert({
      user_id: userId,
      name: data.name,
      email: data.email,
      company: data.company || null,
      status: data.status || "active",
      total_revenue: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return customer;
}

export async function updateCustomer(userId: string, id: string, data: {
  name?: string;
  email?: string;
  company?: string;
  status?: string;
}) {
  const supabase = await createClient();

  const { data: customer, error } = await supabase
    .from("customers")
    .update(data)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return customer;
}

export async function deleteCustomer(userId: string, id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}
