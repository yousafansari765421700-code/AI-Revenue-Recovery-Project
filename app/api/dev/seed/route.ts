import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCustomer } from "@/lib/data/customers/server";
import { createInvoice } from "@/lib/data/invoices/server";
import { createFailedPayment } from "@/lib/data/failed-payments/index";
import { createRecoveryCampaign } from "@/lib/data/recovery/server";
import { createRecoveryAction } from "@/lib/data/recovery/server";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", userId)
    .eq("email", "john@acmecorp.com")
    .maybeSingle();

  if (existingCustomer) {
    return NextResponse.json({ message: "Seed data already exists for this user.", userId });
  }

  const customer1 = await createCustomer(userId, {
    name: "John Smith",
    email: "john@acmecorp.com",
    company: "Acme Corp",
    status: "active",
  });

  const customer2 = await createCustomer(userId, {
    name: "Sarah Johnson",
    email: "sarah@globex.com",
    company: "Globex Inc",
    status: "active",
  });

  const customer3 = await createCustomer(userId, {
    name: "Mike Bolton",
    email: "mike@initech.com",
    company: "Initech",
    status: "active",
  });

  const invoice1 = await createInvoice(userId, {
    customer_id: customer1.id,
    invoice_number: "INV-001",
    amount: 5000,
    currency: "USD",
    status: "paid",
    due_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  });

  const invoice2 = await createInvoice(userId, {
    customer_id: customer1.id,
    invoice_number: "INV-002",
    amount: 3000,
    currency: "USD",
    status: "paid",
    due_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  });

  const invoice3 = await createInvoice(userId, {
    customer_id: customer1.id,
    invoice_number: "INV-003",
    amount: 7500,
    currency: "USD",
    status: "failed",
    due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  });

  const invoice4 = await createInvoice(userId, {
    customer_id: customer2.id,
    invoice_number: "INV-004",
    amount: 4200,
    currency: "USD",
    status: "paid",
    due_date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  });

  const invoice5 = await createInvoice(userId, {
    customer_id: customer2.id,
    invoice_number: "INV-005",
    amount: 6100,
    currency: "USD",
    status: "overdue",
    due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  });

  const failedPayment1 = await createFailedPayment(userId, {
    customer_id: customer1.id,
    invoice_id: invoice3.id,
    amount: 7500,
    failure_reason: "Card declined - insufficient funds",
    recovery_status: "pending",
  });

  const failedPayment2 = await createFailedPayment(userId, {
    customer_id: customer2.id,
    invoice_id: invoice5.id,
    amount: 6100,
    failure_reason: "Card expired",
    recovery_status: "in_progress",
  });

  const campaign1 = await createRecoveryCampaign(userId, {
    name: "Q4 Payment Recovery",
    description: "Automated recovery campaign for Q4 failed payments",
    status: "active",
  });

  const campaign2 = await createRecoveryCampaign(userId, {
    name: "High Value Follow-up",
    description: "Personal outreach for high-value failed payments",
    status: "draft",
  });

  await createRecoveryAction(userId, {
    failed_payment_id: failedPayment1.id,
    campaign_id: campaign1.id,
    action_type: "email",
    status: "pending",
  });

  await createRecoveryAction(userId, {
    failed_payment_id: failedPayment2.id,
    campaign_id: campaign1.id,
    action_type: "email",
    status: "pending",
  });

  const today = new Date().toISOString().split("T")[0];
  const revenueMetricPromises = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    revenueMetricPromises.push(
      supabase.from("revenue_metrics").upsert(
        {
          user_id: userId,
          date,
          total_revenue: i === 0 ? 9200 : 0,
          recovered_revenue: 0,
          lost_revenue: i === 0 ? 6100 : 0,
          failed_payment_amount: i === 0 ? 13600 : 0,
        },
        { onConflict: "user_id,date" }
      )
    );
  }
  await Promise.all(revenueMetricPromises);

  return NextResponse.json({
    message: "Development seed data created successfully.",
    userId,
    customers: 3,
    invoices: 5,
    failedPayments: 2,
    campaigns: 2,
    actions: 2,
    revenueMetrics: 30,
  });
}
