import { createClient } from "@/lib/supabase/server";

export interface DashboardKPIs {
  totalRevenue: number;
  lostRevenue: number;
  recoveredRevenue: number;
  recoveryRate: number;
  totalRevenueChange: number;
  lostRevenueChange: number;
  recoveredRevenueChange: number;
  recoveryRateChange: number;
}

export interface RevenueChartData {
  date: string;
  totalRevenue: number;
  lostRevenue: number;
  recoveredRevenue: number;
}

export interface FailedPayment {
  id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  failure_reason: string | null;
  recovery_status: string;
  detected_at: string;
  invoice_number: string;
}

export interface RecoveryOpportunity {
  id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  probability: number;
  recommended_action: string;
  failure_reason: string | null;
}

export async function getDashboardKPIs(userId: string): Promise<DashboardKPIs> {
  const supabase = await createClient();

  const [invoicesResult, failedPaymentsResult, metricsResult] = await Promise.all([
    supabase.from("invoices").select("amount, status, created_at").eq("user_id", userId),
    supabase.from("failed_payments").select("amount, recovery_status, detected_at").eq("user_id", userId),
    supabase.from("revenue_metrics").select("total_revenue, recovered_revenue, lost_revenue, date").eq("user_id", userId).order("date", { ascending: false }).limit(2),
  ]);

  const invoices = invoicesResult.data || [];
  const failedPayments = failedPaymentsResult.data || [];
  const metrics = metricsResult.data || [];

  const totalRevenue = invoices
    .filter((inv: any) => inv.status === "paid")
    .reduce((sum: number, inv: any) => sum + Number(inv.amount), 0);

  const lostRevenue = invoices
    .filter((inv: any) => inv.status === "failed" || inv.status === "overdue")
    .reduce((sum: number, inv: any) => sum + Number(inv.amount), 0);

  const recoveredRevenue = failedPayments
    .filter((fp: any) => fp.recovery_status === "recovered")
    .reduce((sum: number, fp: any) => sum + Number(fp.amount), 0);

  const totalAttempted = lostRevenue + recoveredRevenue;
  const recoveryRate = totalAttempted > 0 ? (recoveredRevenue / totalAttempted) * 100 : 0;

  const currentTotal = metrics[0]?.total_revenue || 0;
  const previousTotal = metrics[1]?.total_revenue || 0;
  const totalRevenueChange = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

  const currentRecovered = metrics[0]?.recovered_revenue || 0;
  const previousRecovered = metrics[1]?.recovered_revenue || 0;
  const recoveredRevenueChange = previousRecovered > 0 ? ((currentRecovered - previousRecovered) / previousRecovered) * 100 : 0;

  const currentLost = metrics[0]?.lost_revenue || 0;
  const previousLost = metrics[1]?.lost_revenue || 0;
  const lostRevenueChange = previousLost > 0 ? ((currentLost - previousLost) / previousLost) * 100 : 0;

  const currentRate = recoveryRate;
  const previousRate = previousTotal > 0 && totalAttempted > 0 ? (previousRecovered / (previousLost + previousRecovered)) * 100 : 0;
  const recoveryRateChange = previousRate > 0 ? currentRate - previousRate : 0;

  return {
    totalRevenue,
    lostRevenue,
    recoveredRevenue,
    recoveryRate,
    totalRevenueChange,
    lostRevenueChange,
    recoveredRevenueChange,
    recoveryRateChange,
  };
}

export async function getRevenueChartData(userId: string): Promise<RevenueChartData[]> {
  const supabase = await createClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: metrics } = await supabase
    .from("revenue_metrics")
    .select("total_revenue, recovered_revenue, lost_revenue, date")
    .eq("user_id", userId)
    .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (!metrics || metrics.length === 0) {
    return [];
  }

  return metrics.map((m: any) => ({
    date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    totalRevenue: Number(m.total_revenue),
    lostRevenue: Number(m.lost_revenue),
    recoveredRevenue: Number(m.recovered_revenue),
  }));
}

export async function getRecentFailedPayments(userId: string, limit = 5): Promise<FailedPayment[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("failed_payments")
    .select(`
      id,
      amount,
      failure_reason,
      recovery_status,
      detected_at,
      invoice_id,
      customers(name, email)
    `)
    .eq("user_id", userId)
    .order("detected_at", { ascending: false })
    .limit(limit);

  if (!data) return [];

  const { data: invoices } = await supabase
    .from("invoices")
    .select("invoice_number, id")
    .in("id", data.map((fp: any) => fp.invoice_id));

  const invoiceMap = new Map((invoices || []).map((inv: any) => [inv.id, inv.invoice_number]));

  return data.map((fp: any) => ({
    id: fp.id,
    customer_name: fp.customers?.name || "Unknown",
    customer_email: fp.customers?.email || "",
    amount: Number(fp.amount),
    failure_reason: fp.failure_reason,
    recovery_status: fp.recovery_status,
    detected_at: fp.detected_at,
    invoice_number: invoiceMap.get(fp.invoice_id) || "N/A",
  }));
}

export async function getRecoveryOpportunities(userId: string): Promise<RecoveryOpportunity[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("failed_payments")
    .select(`
      id,
      amount,
      failure_reason,
      recovery_status,
      customers(name, email)
    `)
    .eq("user_id", userId)
    .in("recovery_status", ["pending", "in_progress"])
    .order("detected_at", { ascending: false })
    .limit(5);

  if (!data) return [];

  return data.map((fp: any) => ({
    id: fp.id,
    customer_name: fp.customers?.name || "Unknown",
    customer_email: fp.customers?.email || "",
    amount: Number(fp.amount),
    probability: fp.recovery_status === "in_progress" ? 75 : 45,
    recommended_action: fp.recovery_status === "in_progress" ? "Continue recovery workflow" : "Initiate payment retry",
    failure_reason: fp.failure_reason,
  }));
}

export async function getRevenueAtRisk(userId: string): Promise<number> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("failed_payments")
    .select("amount")
    .eq("user_id", userId)
    .in("recovery_status", ["pending", "in_progress"]);

  if (!data || data.length === 0) return 0;

  return data.reduce((sum: number, fp: any) => sum + Number(fp.amount), 0);
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("business_name, full_name, email")
    .eq("id", userId)
    .single();

  return data;
}
