import { createClient } from "@/lib/supabase/server";

export interface AnalyticsKPIs {
  totalRevenue: number;
  lostRevenue: number;
  recoveredRevenue: number;
  recoveryRate: number;
  totalRevenueChange: number;
  lostRevenueChange: number;
  recoveredRevenueChange: number;
  recoveryRateChange: number;
}

export interface RevenueTrendData {
  date: string;
  totalRevenue: number;
  lostRevenue: number;
  recoveredRevenue: number;
}

export interface FailedPaymentTrendData {
  date: string;
  count: number;
  amount: number;
}

export interface CustomerPaymentBehavior {
  customer_name: string;
  total_invoices: number;
  paid_invoices: number;
  failed_invoices: number;
  payment_rate: number;
}

export interface RecoveryOpportunity {
  id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  recovery_status: string;
  detected_at: string;
  probability: number;
}

export interface AIInsight {
  id: string;
  type: "warning" | "opportunity" | "success" | "info";
  title: string;
  description: string;
  isEstimate: boolean;
  potentialAmount?: number;
}

export interface AIRecommendation {
  insight: string;
  whyItMatters: string;
  recommendedAction: string;
  potentialRecoveryAmount: number;
  isEstimate: boolean;
}

export async function getAnalyticsKPIs(userId: string): Promise<AnalyticsKPIs> {
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

export async function getRevenueTrendData(userId: string): Promise<RevenueTrendData[]> {
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

export async function getFailedPaymentTrends(userId: string): Promise<FailedPaymentTrendData[]> {
  const supabase = await createClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: failedPayments } = await supabase
    .from("failed_payments")
    .select("amount, detected_at")
    .eq("user_id", userId)
    .gte("detected_at", thirtyDaysAgo.toISOString());

  if (!failedPayments || failedPayments.length === 0) {
    return [];
  }

  const groupedByDate = failedPayments.reduce((acc: any, fp: any) => {
    const date = new Date(fp.detected_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!acc[date]) {
      acc[date] = { count: 0, amount: 0 };
    }
    acc[date].count++;
    acc[date].amount += Number(fp.amount);
    return acc;
  }, {});

  return Object.entries(groupedByDate).map(([date, data]: [string, any]) => ({
    date,
    count: data.count,
    amount: data.amount,
  }));
}

export async function getCustomerPaymentBehavior(userId: string): Promise<CustomerPaymentBehavior[]> {
  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select(`
      customer_id,
      status,
      customers(name)
    `)
    .eq("user_id", userId);

  if (!invoices || invoices.length === 0) {
    return [];
  }

  const grouped = invoices.reduce((acc: any, inv: any) => {
    const customerName = inv.customers?.name || "Unknown";
    if (!acc[customerName]) {
      acc[customerName] = {
        customer_name: customerName,
        total_invoices: 0,
        paid_invoices: 0,
        failed_invoices: 0,
      };
    }
    acc[customerName].total_invoices++;
    if (inv.status === "paid") {
      acc[customerName].paid_invoices++;
    } else if (inv.status === "failed" || inv.status === "overdue") {
      acc[customerName].failed_invoices++;
    }
    return acc;
  }, {});

  return Object.values(grouped).map((customer: any) => ({
    ...customer,
    payment_rate: customer.total_invoices > 0 ? (customer.paid_invoices / customer.total_invoices) * 100 : 0,
  }));
}

export async function getRecoveryOpportunities(userId: string): Promise<RecoveryOpportunity[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("failed_payments")
    .select(`
      id,
      amount,
      recovery_status,
      detected_at,
      customers(name, email)
    `)
    .eq("user_id", userId)
    .in("recovery_status", ["pending", "in_progress"])
    .order("detected_at", { ascending: false })
    .limit(10);

  if (!data) return [];

  return data.map((fp: any) => ({
    id: fp.id,
    customer_name: fp.customers?.name || "Unknown",
    customer_email: fp.customers?.email || "",
    amount: Number(fp.amount),
    recovery_status: fp.recovery_status,
    detected_at: fp.detected_at,
    probability: fp.recovery_status === "in_progress" ? 75 : 45,
  }));
}

export async function getAIInsights(userId: string): Promise<AIInsight[]> {
  const supabase = await createClient();

  const [invoicesResult, failedPaymentsResult, recoveryCampaignsResult] = await Promise.all([
    supabase.from("invoices").select("status, created_at, amount").eq("user_id", userId),
    supabase.from("failed_payments").select("recovery_status, detected_at, amount").eq("user_id", userId),
    supabase.from("recovery_campaigns").select("status, recovered_amount").eq("user_id", userId),
  ]);

  const invoices = invoicesResult.data || [];
  const failedPayments = failedPaymentsResult.data || [];
  const recoveryCampaigns = recoveryCampaignsResult.data || [];

  const insights: AIInsight[] = [];

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentFailures = failedPayments.filter((fp: any) => new Date(fp.detected_at) > oneWeekAgo);
  const previousWeekFailures = failedPayments.filter((fp: any) => {
    const detected = new Date(fp.detected_at);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    return detected > twoWeeksAgo && detected <= oneWeekAgo;
  });

  if (recentFailures.length > previousWeekFailures.length) {
    insights.push({
      id: "1",
      type: "warning",
      title: "Failed payments increased this week",
      description: `You have ${recentFailures.length} failed payments detected this week, compared to ${previousWeekFailures.length} last week. This represents an increase in payment failures.`,
      isEstimate: true,
      potentialAmount: recentFailures.reduce((sum: number, fp: any) => sum + Number(fp.amount), 0),
    });
  }

  const overdueInvoices = invoices.filter((inv: any) => inv.status === "overdue");
  if (overdueInvoices.length > 0) {
    const overdueAmount = overdueInvoices.reduce((sum: number, inv: any) => sum + Number(inv.amount), 0);
    insights.push({
      id: "2",
      type: "opportunity",
      title: "Overdue invoices represent a recovery opportunity",
      description: `You have ${overdueInvoices.length} overdue invoices totaling ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(overdueAmount)}. These can be recovered with automated follow-ups.`,
      isEstimate: true,
      potentialAmount: overdueAmount,
    });
  }

  const recoveredAmount = failedPayments
    .filter((fp: any) => fp.recovery_status === "recovered")
    .reduce((sum: number, fp: any) => sum + Number(fp.amount), 0);

  const activeCampaigns = recoveryCampaigns.filter((c: any) => c.status === "active");
  if (activeCampaigns.length > 0 && recoveredAmount > 0) {
    insights.push({
      id: "3",
      type: "success",
      title: "Recovery campaigns are showing results",
      description: `Your active campaigns have recovered ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(recoveredAmount)} so far. Consider expanding successful campaigns to similar customer segments.`,
      isEstimate: false,
    });
  }

  const pendingRecoveries = failedPayments.filter((fp: any) => fp.recovery_status === "pending");
  if (pendingRecoveries.length > 0) {
    insights.push({
      id: "4",
      type: "opportunity",
      title: "Multiple payment recoveries are pending",
      description: `${pendingRecoveries.length} failed payments are awaiting recovery action. Initiating recovery workflows promptly increases success rates by up to 60%.`,
      isEstimate: true,
      potentialAmount: pendingRecoveries.reduce((sum: number, fp: any) => sum + Number(fp.amount), 0),
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "5",
      type: "info",
      title: "No significant insights at this time",
      description: "Your revenue metrics appear stable. Continue monitoring for patterns and opportunities.",
      isEstimate: false,
    });
  }

  return insights;
}

export async function getAIRecommendation(userId: string): Promise<AIRecommendation | null> {
  const supabase = await createClient();

  const { data: failedPayments } = await supabase
    .from("failed_payments")
    .select("amount, recovery_status, detected_at, failure_reason")
    .eq("user_id", userId)
    .in("recovery_status", ["pending", "in_progress"])
    .order("detected_at", { ascending: false })
    .limit(1);

  if (!failedPayments || failedPayments.length === 0) {
    return {
      insight: "No immediate recovery opportunities detected",
      whyItMatters: "Your current failed payments are either recovered or not yet detected. Regular monitoring helps catch issues early.",
      recommendedAction: "Continue monitoring your payment pipeline and set up automated alerts for new failures.",
      potentialRecoveryAmount: 0,
      isEstimate: false,
    };
  }

  const topOpportunity = failedPayments[0];
  const amount = Number(topOpportunity.amount);

  return {
    insight: `You have a ${topOpportunity.recovery_status === "in_progress" ? "high-probability" : "potential"} recovery opportunity worth ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)}`,
    whyItMatters: `This payment failed due to "${topOpportunity.failure_reason || "unknown reason"}". Automated recovery workflows typically recover 60-75% of failed payments when initiated within 48 hours.`,
    recommendedAction: topOpportunity.recovery_status === "pending"
      ? "Initiate automated recovery workflow: send payment retry email with updated payment link and customer support contact."
      : "Continue monitoring the recovery workflow and follow up with the customer if no response within 24 hours.",
    potentialRecoveryAmount: amount * (topOpportunity.recovery_status === "in_progress" ? 0.75 : 0.6),
    isEstimate: true,
  };
}
