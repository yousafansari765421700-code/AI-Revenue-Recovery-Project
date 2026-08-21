"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import AIRevenueIntelligence from "@/components/dashboard/analytics/AIRevenueIntelligence";
import RevenueTrendChart from "@/components/dashboard/analytics/RevenueTrendChart";
import FailedPaymentTrendsChart from "@/components/dashboard/analytics/FailedPaymentTrendsChart";
import CustomerPaymentBehavior from "@/components/dashboard/analytics/CustomerPaymentBehavior";
import RecoveryOpportunities from "@/components/dashboard/analytics/RecoveryOpportunities";
import AIRecommendationPanel from "@/components/dashboard/analytics/AIRecommendationPanel";
import {
  getAnalyticsKPIs,
  getRevenueTrendData,
  getFailedPaymentTrends,
  getCustomerPaymentBehavior,
  getRecoveryOpportunities,
  getAIInsights,
  getAIRecommendation,
} from "@/lib/data/analytics/client";
import type {
  AnalyticsKPIs,
  RevenueTrendData,
  FailedPaymentTrendData,
  CustomerPaymentBehavior as CustomerPaymentBehaviorType,
  RecoveryOpportunity,
  AIInsight,
  AIRecommendation,
} from "@/lib/data/analytics/client";

function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} padding="md">
          <div className="flex items-start justify-between mb-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </Card>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <Card padding="lg">
      <div className="mb-6">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-80 w-full" />
    </Card>
  );
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<AnalyticsKPIs | null>(null);
  const [revenueTrendData, setRevenueTrendData] = useState<RevenueTrendData[]>([]);
  const [failedPaymentTrends, setFailedPaymentTrends] = useState<FailedPaymentTrendData[]>([]);
  const [customerBehavior, setCustomerBehavior] = useState<CustomerPaymentBehaviorType[]>([]);
  const [recoveryOpportunities, setRecoveryOpportunities] = useState<RecoveryOpportunity[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          kpisData,
          revenueData,
          failedTrends,
          customerData,
          opportunities,
          insightsData,
          recommendationData,
        ] = await Promise.all([
          getAnalyticsKPIs(user.id),
          getRevenueTrendData(user.id),
          getFailedPaymentTrends(user.id),
          getCustomerPaymentBehavior(user.id),
          getRecoveryOpportunities(user.id),
          getAIInsights(user.id),
          getAIRecommendation(user.id),
        ]);

        setKpis(kpisData);
        setRevenueTrendData(revenueData);
        setFailedPaymentTrends(failedTrends);
        setCustomerBehavior(customerData);
        setRecoveryOpportunities(opportunities);
        setInsights(insightsData);
        setRecommendation(recommendationData);
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-dark mb-2">Analytics</h1>
        <p className="text-muted">AI-powered revenue insights and performance metrics</p>
      </div>

      <AIRevenueIntelligence insights={insights} />

      {loading ? (
        <KPISkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card hover padding="md">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${kpis?.totalRevenueChange && kpis.totalRevenueChange >= 0 ? "text-success" : "text-danger"}`}>
                {kpis?.totalRevenueChange && kpis.totalRevenueChange >= 0 ? "↑" : "↓"}
                {kpis?.totalRevenueChange ? Math.abs(kpis.totalRevenueChange).toFixed(1) : "0"}%
              </div>
            </div>
            <p className="text-2xl font-bold text-dark mb-1">{formatCurrency(kpis?.totalRevenue || 0)}</p>
            <p className="text-sm text-muted">Total Revenue</p>
          </Card>

          <Card hover padding="md">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-danger-light flex items-center justify-center text-danger">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${kpis?.lostRevenueChange && kpis.lostRevenueChange >= 0 ? "text-danger" : "text-success"}`}>
                {kpis?.lostRevenueChange && kpis.lostRevenueChange >= 0 ? "↑" : "↓"}
                {kpis?.lostRevenueChange ? Math.abs(kpis.lostRevenueChange).toFixed(1) : "0"}%
              </div>
            </div>
            <p className="text-2xl font-bold text-dark mb-1">{formatCurrency(kpis?.lostRevenue || 0)}</p>
            <p className="text-sm text-muted">Revenue Lost</p>
          </Card>

          <Card hover padding="md">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-success-light flex items-center justify-center text-success">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${kpis?.recoveredRevenueChange && kpis.recoveredRevenueChange >= 0 ? "text-success" : "text-danger"}`}>
                {kpis?.recoveredRevenueChange && kpis.recoveredRevenueChange >= 0 ? "↑" : "↓"}
                {kpis?.recoveredRevenueChange ? Math.abs(kpis.recoveredRevenueChange).toFixed(1) : "0"}%
              </div>
            </div>
            <p className="text-2xl font-bold text-dark mb-1">{formatCurrency(kpis?.recoveredRevenue || 0)}</p>
            <p className="text-sm text-muted">Revenue Recovered</p>
          </Card>

          <Card hover padding="md">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center text-accent">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${kpis?.recoveryRateChange && kpis.recoveryRateChange >= 0 ? "text-success" : "text-danger"}`}>
                {kpis?.recoveryRateChange && kpis.recoveryRateChange >= 0 ? "↑" : "↓"}
                {kpis?.recoveryRateChange ? Math.abs(kpis.recoveryRateChange).toFixed(1) : "0"}%
              </div>
            </div>
            <p className="text-2xl font-bold text-dark mb-1">{kpis?.recoveryRate ? kpis.recoveryRate.toFixed(1) : "0"}%</p>
            <p className="text-sm text-muted">Recovery Rate</p>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <RevenueTrendChart data={revenueTrendData} />
            <FailedPaymentTrendsChart data={failedPaymentTrends} />
          </>
        )}
      </div>

      {loading ? (
        <ChartSkeleton />
      ) : (
        <CustomerPaymentBehavior data={customerBehavior} />
      )}

      {loading ? (
        <ChartSkeleton />
      ) : (
        <RecoveryOpportunities opportunities={recoveryOpportunities} />
      )}

      {loading ? (
        <ChartSkeleton />
      ) : (
        <AIRecommendationPanel recommendation={recommendation} />
      )}
    </div>
  );
}
