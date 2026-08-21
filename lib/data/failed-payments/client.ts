import { createClient } from "@/lib/supabase/browser";

export interface FailedPaymentDetail {
  id: string;
  user_id: string;
  customer_id: string;
  invoice_id: string;
  amount: number;
  failure_reason: string | null;
  recovery_status: "pending" | "in_progress" | "recovered" | "failed";
  detected_at: string;
  recovered_at: string | null;
  customer_name: string;
  customer_email: string;
  customer_company: string | null;
  invoice_number: string;
  invoice_due_date: string | null;
  invoice_currency: string;
  recovery_actions: {
    id: string;
    action_type: string;
    status: string;
    executed_at: string | null;
    created_at: string;
  }[];
}

export interface FailedPaymentListItem {
  id: string;
  customer_name: string;
  customer_email: string;
  company: string | null;
  invoice_number: string;
  amount: number;
  currency: string;
  failure_reason: string | null;
  recovery_status: string;
  detected_at: string;
  recovery_potential: number;
}

export async function getFailedPayments(
  userId: string,
  filters: {
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    amountMin?: number;
    amountMax?: number;
  } = {}
): Promise<FailedPaymentListItem[]> {
  const supabase = createClient();

  let query = supabase
    .from("failed_payments")
    .select(`
      id,
      amount,
      failure_reason,
      recovery_status,
      detected_at,
      invoice_id,
      customers(name, email, company),
      invoices(invoice_number, currency, due_date)
    `)
    .eq("user_id", userId)
    .order("detected_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("recovery_status", filters.status);
  }

  if (filters.search) {
    query = query.or(`customers.name.ilike.%${filters.search}%,customers.email.ilike.%${filters.search}%,invoices.invoice_number.ilike.%${filters.search}%`);
  }

  if (filters.dateFrom) {
    query = query.gte("detected_at", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("detected_at", filters.dateTo);
  }

  if (filters.amountMin !== undefined) {
    query = query.gte("amount", filters.amountMin);
  }

  if (filters.amountMax !== undefined) {
    query = query.lte("amount", filters.amountMax);
  }

  const { data } = await query;

  if (!data) return [];

  return data.map((fp: any) => {
    const amount = Number(fp.amount);
    const recoveryPotential = fp.recovery_status === "pending" ? amount * 0.6 : 
                              fp.recovery_status === "in_progress" ? amount * 0.75 : 0;

    return {
      id: fp.id,
      customer_name: fp.customers?.name || "Unknown",
      customer_email: fp.customers?.email || "",
      company: fp.customers?.company || null,
      invoice_number: fp.invoices?.invoice_number || "N/A",
      amount,
      currency: fp.invoices?.currency || "USD",
      failure_reason: fp.failure_reason,
      recovery_status: fp.recovery_status,
      detected_at: fp.detected_at,
      recovery_potential: recoveryPotential,
    };
  });
}

export async function getFailedPaymentById(userId: string, id: string): Promise<FailedPaymentDetail | null> {
  const supabase = createClient();

  const { data: payment } = await supabase
    .from("failed_payments")
    .select(`
      id,
      user_id,
      customer_id,
      invoice_id,
      amount,
      failure_reason,
      recovery_status,
      detected_at,
      recovered_at,
      customers(name, email, company),
      invoices(invoice_number, currency, due_date)
    `)
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!payment) return null;

  const { data: actions } = await supabase
    .from("recovery_actions")
    .select("id, action_type, status, executed_at, created_at")
    .eq("failed_payment_id", id)
    .order("created_at", { ascending: false });

  const fp: any = payment;
  return {
    id: fp.id,
    user_id: fp.user_id,
    customer_id: fp.customer_id,
    invoice_id: fp.invoice_id,
    amount: Number(fp.amount),
    failure_reason: fp.failure_reason,
    recovery_status: fp.recovery_status,
    detected_at: fp.detected_at,
    recovered_at: fp.recovered_at,
    customer_name: fp.customers?.name || "Unknown",
    customer_email: fp.customers?.email || "",
    customer_company: fp.customers?.company || null,
    invoice_number: fp.invoices?.invoice_number || "N/A",
    invoice_due_date: fp.invoices?.due_date || null,
    invoice_currency: fp.invoices?.currency || "USD",
    recovery_actions: actions || [],
  };
}

export async function createFailedPayment(userId: string, data: {
  customer_id: string;
  invoice_id: string;
  amount: number;
  failure_reason?: string;
  recovery_status?: string;
}) {
  const supabase = createClient();

  const { data: payment, error } = await supabase
    .from("failed_payments")
    .insert({
      user_id: userId,
      customer_id: data.customer_id,
      invoice_id: data.invoice_id,
      amount: data.amount,
      failure_reason: data.failure_reason || null,
      recovery_status: data.recovery_status || "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return payment;
}

export async function startRecovery(userId: string, failedPaymentId: string) {
  const supabase = createClient();

  const { error: updateError } = await supabase
    .from("failed_payments")
    .update({ recovery_status: "in_progress" })
    .eq("id", failedPaymentId)
    .eq("user_id", userId);

  if (updateError) throw updateError;

  const { error: actionError } = await supabase
    .from("recovery_actions")
    .insert({
      user_id: userId,
      failed_payment_id: failedPaymentId,
      action_type: "email",
      status: "pending",
    });

  if (actionError) throw actionError;

  return { success: true };
}
