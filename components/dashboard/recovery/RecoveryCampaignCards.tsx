"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Mail, RefreshCw, FileText, DollarSign, Plus, TrendingUp } from "lucide-react";

interface RecoveryCampaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
  recovered_amount: number;
  created_at: string;
}

interface RecoveryCampaignCardsProps {
  campaigns: RecoveryCampaign[];
  onCreateCampaign: () => void;
}

const defaultCampaigns = [
  {
    id: "friendly-reminder",
    name: "Friendly Reminder",
    description: "Send a polite payment reminder email to customers with pending or overdue invoices.",
    icon: <Mail className="w-6 h-6" />,
    color: "primary",
    strategy: "email",
  },
  {
    id: "payment-retry",
    name: "Payment Retry",
    description: "Automatically retry failed payments using the original payment method.",
    icon: <RefreshCw className="w-6 h-6" />,
    color: "accent",
    strategy: "retry_payment",
  },
  {
    id: "invoice-follow-up",
    name: "Invoice Follow-up",
    description: "Follow up on overdue invoices with a structured sequence of reminders.",
    icon: <FileText className="w-6 h-6" />,
    color: "secondary",
    strategy: "email",
  },
  {
    id: "high-value-recovery",
    name: "High Value Recovery",
    description: "Prioritized recovery workflow for high-value failed payments with personal outreach.",
    icon: <DollarSign className="w-6 h-6" />,
    color: "success",
    strategy: "call",
  },
];

const colorMap: Record<string, string> = {
  primary: "bg-primary-light text-primary",
  secondary: "bg-secondary-light text-secondary",
  accent: "bg-accent-light text-accent",
  success: "bg-success-light text-success",
};

export default function RecoveryCampaignCards({ campaigns, onCreateCampaign }: RecoveryCampaignCardsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-dark">Recovery Campaigns</h3>
          <p className="text-sm text-muted">Create and manage automated recovery workflows</p>
        </div>
        <Button onClick={onCreateCampaign} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Campaign
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {defaultCampaigns.map((campaign) => (
          <Card key={campaign.id} hover padding="lg">
            <div className={`w-12 h-12 rounded-xl ${colorMap[campaign.color]} flex items-center justify-center mb-4`}>
              {campaign.icon}
            </div>
            <h4 className="font-semibold text-dark mb-2">{campaign.name}</h4>
            <p className="text-sm text-muted mb-4 line-clamp-2">{campaign.description}</p>
            <div className="flex items-center justify-between">
              <Badge variant="neutral" size="sm">{campaign.strategy.replace("_", " ")}</Badge>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Use
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {campaigns.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-dark">Your Campaigns</h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} padding="md">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-dark">{campaign.name}</h5>
                  <Badge variant={campaign.status === "active" ? "success" : campaign.status === "completed" ? "primary" : "warning"} size="sm">
                    {campaign.status}
                  </Badge>
                </div>
                {campaign.description && (
                  <p className="text-sm text-muted mb-3 line-clamp-2">{campaign.description}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Recovered:</span>
                  <span className="font-medium text-success">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(campaign.recovered_amount)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
