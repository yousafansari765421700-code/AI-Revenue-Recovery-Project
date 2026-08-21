import DashboardGreeting from "@/components/dashboard/DashboardGreeting";
import KPICards from "@/components/dashboard/KPICards";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RevenueAtRiskCard from "@/components/dashboard/RevenueAtRiskCard";
import FailedPaymentsTable from "@/components/dashboard/FailedPaymentsTable";
import RecoveryOpportunities from "@/components/dashboard/RecoveryOpportunities";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  getDashboardKPIs,
  getRevenueChartData,
  getRecentFailedPayments,
  getRecoveryOpportunities,
  getRevenueAtRisk,
  getUserProfile,
} from "@/lib/data/dashboard";

export default async function DashboardPage() {
  const supabase = await (await import("@/lib/supabase/server")).createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [kpis, chartData, failedPayments, opportunities, revenueAtRisk, profile] = await Promise.all([
    getDashboardKPIs(user.id),
    getRevenueChartData(user.id),
    getRecentFailedPayments(user.id),
    getRecoveryOpportunities(user.id),
    getRevenueAtRisk(user.id),
    getUserProfile(user.id),
  ]);

  return (
    <div className="space-y-8">
      <DashboardGreeting businessName={profile?.business_name} fullName={profile?.full_name} />

      <KPICards
        totalRevenue={kpis.totalRevenue}
        lostRevenue={kpis.lostRevenue}
        recoveredRevenue={kpis.recoveredRevenue}
        recoveryRate={kpis.recoveryRate}
        totalRevenueChange={kpis.totalRevenueChange}
        lostRevenueChange={kpis.lostRevenueChange}
        recoveredRevenueChange={kpis.recoveredRevenueChange}
        recoveryRateChange={kpis.recoveryRateChange}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <RevenueChart data={chartData} />
        <RevenueAtRiskCard amount={revenueAtRisk} />
      </div>

      <FailedPaymentsTable payments={failedPayments} />

      <RecoveryOpportunities opportunities={opportunities} />
    </div>
  );
}
