"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/toast/Toast";
import { useAuth } from "@/contexts/AuthContext";
import RecoverySummaryCards from "@/components/dashboard/recovery/RecoverySummaryCards";
import RecoveryOpportunitiesTable from "@/components/dashboard/recovery/RecoveryOpportunitiesTable";
import RecoveryCampaignCards from "@/components/dashboard/recovery/RecoveryCampaignCards";
import RecoveryTimeline from "@/components/dashboard/recovery/RecoveryTimeline";
import CreateCampaignModal from "@/components/dashboard/recovery/CreateCampaignModal";
import { startRecovery } from "@/lib/data/failed-payments/client";
import {
  getRecoverySummary,
  getRecoveryOpportunities,
  getRecoveryCampaigns,
  createRecoveryCampaign,
  getRecoveryActivityTimeline,
} from "@/lib/data/recovery/client";
import type { RecoverySummary, RecoveryOpportunity, RecoveryCampaign, TimelineEvent } from "@/lib/data/recovery/client";

function SummarySkeleton() {
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

function TableSkeleton() {
  return (
    <Card padding="lg">
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function RecoveryPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<RecoverySummary | null>(null);
  const [opportunities, setOpportunities] = useState<RecoveryOpportunity[]>([]);
  const [campaigns, setCampaigns] = useState<RecoveryCampaign[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [summaryData, opportunitiesData, campaignsData, timelineData] = await Promise.all([
        getRecoverySummary(user.id),
        getRecoveryOpportunities(user.id),
        getRecoveryCampaigns(user.id),
        getRecoveryActivityTimeline(user.id),
      ]);

      setSummary(summaryData);
      setOpportunities(opportunitiesData);
      setCampaigns(campaignsData);
      setTimeline(timelineData);
    } catch (error) {
      console.error("Failed to fetch recovery data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleStartRecovery = async (opportunity: RecoveryOpportunity) => {
    if (!user) return;
    try {
      await startRecovery(user.id, opportunity.id);
      addToast("success", "Recovery started successfully!");
      fetchData();
    } catch (error) {
      console.error("Failed to start recovery:", error);
      addToast("error", "Failed to start recovery. Please try again.");
    }
  };

  const handleCreateCampaign = async (data: { name: string; description?: string; status?: string }) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await createRecoveryCampaign(user.id, data);
      addToast("success", "Campaign created successfully!");
      setIsCreateModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Failed to create campaign:", error);
      addToast("error", "Failed to create campaign. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-dark mb-2">Recovery Center</h1>
        <p className="text-muted">Turn failed payments and overdue invoices into recovered revenue.</p>
      </div>

      {loading ? (
        <SummarySkeleton />
      ) : (
        <RecoverySummaryCards summary={summary!} />
      )}

      {loading ? (
        <TableSkeleton />
      ) : (
        <RecoveryOpportunitiesTable opportunities={opportunities} onStartRecovery={handleStartRecovery} />
      )}

      <RecoveryCampaignCards campaigns={campaigns} onCreateCampaign={() => setIsCreateModalOpen(true)} />

      {loading ? (
        <Card padding="lg">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-64" />
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <RecoveryTimeline events={timeline} />
      )}

      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCampaign}
        isLoading={isSubmitting}
      />
    </div>
  );
}
