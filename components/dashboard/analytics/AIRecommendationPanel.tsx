"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Lightbulb, DollarSign, ArrowRight, CheckCircle } from "lucide-react";

interface AIRecommendation {
  insight: string;
  whyItMatters: string;
  recommendedAction: string;
  potentialRecoveryAmount: number;
  isEstimate: boolean;
}

interface AIRecommendationPanelProps {
  recommendation: AIRecommendation | null;
}

export default function AIRecommendationPanel({ recommendation }: AIRecommendationPanelProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!recommendation) {
    return (
      <Card padding="lg">
        <div className="text-center py-12">
          <p className="text-muted text-lg">No recommendations available</p>
          <p className="text-muted text-sm mt-2">Add some data to get AI-powered insights</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="border-primary/20">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white flex-shrink-0">
          <Lightbulb className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-dark mb-1">AI Recommendation</h3>
          <p className="text-sm text-muted">Based on your revenue data analysis</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-5 bg-background rounded-xl">
          <h4 className="text-sm font-semibold text-dark mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Insight
          </h4>
          <p className="text-sm text-dark leading-relaxed">{recommendation.insight}</p>
          {recommendation.isEstimate && (
            <Badge variant="warning" size="sm" className="mt-2">Estimate</Badge>
          )}
        </div>

        <div className="p-5 bg-background rounded-xl">
          <h4 className="text-sm font-semibold text-dark mb-2">Why It Matters</h4>
          <p className="text-sm text-muted leading-relaxed">{recommendation.whyItMatters}</p>
        </div>

        <div className="p-5 bg-background rounded-xl">
          <h4 className="text-sm font-semibold text-dark mb-2 flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-primary" />
            Recommended Action
          </h4>
          <p className="text-sm text-muted leading-relaxed">{recommendation.recommendedAction}</p>
        </div>

        <div className="flex items-center justify-between p-5 bg-primary-light rounded-xl">
          <div>
            <p className="text-sm text-primary font-medium mb-1">Potential Recovery Amount</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(recommendation.potentialRecoveryAmount)}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>
    </Card>
  );
}
