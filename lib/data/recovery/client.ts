import { createClient } from "@/lib/supabase/browser";

export interface RecoverySummary {
  revenueAtRisk: number;
  recoveryInProgress: number;
  successfullyRecovered: number;
  recoveryRate: number;
}

export interface RecoveryOpportunity {
  id: string;
  customer_name: string;
  amount: number;
  failure_type: string;
  recovery_score: number;
  recommended_action: string;
  recovery_status: string;
  detected_at: string;
}

export interface RecoveryCampaign {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: string;
  recovered_amount: number;
  created_at: string;
  updated_at: string;
}

export interface RecoveryActivity {
  id: string;
  failed_payment_id: string;
  action_type: string;
  status: string;
  executed_at: string | null;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  action_type: string;
  status: string;
  executed_at: string | null;
  created_at: string;
  customer_name: string;
  detected_at: string;
}

export async function getRecoverySummary(userId: string): Promise<RecoverySummary> {
  const supabase = createClient();

  const { data: failedPayments } = await supabase
    .from("failed_payments")
    .select("amount, recovery_status")
    .eq("user_id", userId);

  const revenueAtRisk = failedPayments
    ?.filter((fp) => fp.recovery_status === "pending" || fp.recovery_status === "in_progress")
    .reduce((sum, fp) => sum + Number(fp.amount), 0) || 0;

  const recoveryInProgress = failedPayments
    ?.filter((fp) => fp.recovery_status === "in_progress")
    .reduce((sum, fp) => sum + Number(fp.amount), 0) || 0;

  const successfullyRecovered = failedPayments
    ?.filter((fp) => fp.recovery_status === "recovered")
    .reduce((sum, fp) => sum + Number(fp.amount), 0) || 0;

  const totalAttempted = revenueAtRisk + successfullyRecovered;
  const recoveryRate = totalAttempted > 0 ? (successfullyRecovered / totalAttempted) * 100 : 0;

  return {
    revenueAtRisk,
    recoveryInProgress,
    successfullyRecovered,
    recoveryRate,
  };
}

export async function getRecoveryOpportunities(userId: string): Promise<RecoveryOpportunity[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from("failed_payments")
    .select(`
      id,
      amount,
      failure_reason,
      recovery_status,
      detected_at,
      customers(name, company)
    `)
    .eq("user_id", userId)
    .in("recovery_status", ["pending", "in_progress"])
    .order("detected_at", { ascending: false });

  if (!data) return [];

  return data.map((fp: any) => {
    const amount = Number(fp.amount);
    const recoveryStatus = fp.recovery_status;
    
    let recoveryScore = 0;
    if (recoveryStatus === "in_progress") {
      recoveryScore = 75;
    } else if (recoveryStatus === "pending") {
      recoveryScore = 45;
    }

    const failureType = fp.failure_reason || "Unknown";
    const recommendedAction = recoveryStatus === "in_progress"
      ? "Continue automated recovery workflow"
      : recoveryStatus === "pending"
      ? "Initiate payment retry via email"
      : "Review and determine next steps";

    return {
      id: fp.id,
      customer_name: fp.customers?.name || "Unknown",
      amount,
      failure_type: failureType,
      recovery_score: recoveryScore,
      recommended_action: recommendedAction,
      recovery_status: recoveryStatus,
      detected_at: fp.detected_at,
    };
  });
}

export async function getRecoveryCampaigns(userId: string): Promise<RecoveryCampaign[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from("recovery_campaigns")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!data) return [];

  return data.map((c: any) => ({
    id: c.id,
    user_id: c.user_id,
    name: c.name,
    description: c.description,
    status: c.status,
    recovered_amount: Number(c.recovered_amount),
    created_at: c.created_at,
    updated_at: c.updated_at,
  }));
}

export async function createRecoveryCampaign(userId: string, data: {
  name: string;
  description?: string;
  status?: string;
}) {
  const supabase = createClient();

  const { data: campaign, error } = await supabase
    .from("recovery_campaigns")
    .insert({
      user_id: userId,
      name: data.name,
      description: data.description || null,
      status: data.status || "draft",
      recovered_amount: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return campaign;
}

export async function createRecoveryAction(userId: string, data: {
  failed_payment_id: string;
  campaign_id?: string;
  action_type: string;
  status?: string;
}) {
  const supabase = createClient();

  const { data: action, error } = await supabase
    .from("recovery_actions")
    .insert({
      user_id: userId,
      failed_payment_id: data.failed_payment_id,
      campaign_id: data.campaign_id || null,
      action_type: data.action_type,
      status: data.status || "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return action;
}

export async function getRecoveryActivityTimeline(userId: string) {
  const supabase = createClient();

  const { data: actions } = await supabase
    .from("recovery_actions")
    .select(`
      id,
      action_type,
      status,
      executed_at,
      created_at,
      failed_payments(detected_at, customers(name))
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!actions) return [];

  return actions.map((action: any) => ({
    id: action.id,
    action_type: action.action_type,
    status: action.status,
    executed_at: action.executed_at,
    created_at: action.created_at,
    detected_at: action.failed_payments?.detected_at,
    customer_name: action.failed_payments?.customers?.name || "Unknown",
  }));
}
