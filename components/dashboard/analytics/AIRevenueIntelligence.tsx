"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, TrendingUp, CheckCircle, Info, Lightbulb } from "lucide-react";

interface AIInsight {
  id: string;
  type: "warning" | "opportunity" | "success" | "info";
  title: string;
  description: string;
  isEstimate: boolean;
  potentialAmount?: number;
}

interface AIRevenueIntelligenceProps {
  insights: AIInsight[];
}

const iconMap = {
  warning: <AlertTriangle className="w-5 h-5" />,
  opportunity: <TrendingUp className="w-5 h-5" />,
  success: <CheckCircle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

const colorMap = {
  warning: {
    bg: "bg-warning-light",
    text: "text-warning",
  },
  opportunity: {
    bg: "bg-primary-light",
    text: "text-primary",
  },
  success: {
    bg: "bg-success-light",
    text: "text-success",
  },
  info: {
    bg: "bg-accent-light",
    text: "text-accent",
  },
};

export default function AIRevenueIntelligence({ insights }: AIRevenueIntelligenceProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-dark">AI Revenue Intelligence</h2>
          <p className="text-sm text-muted">Generated from your actual revenue data</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {insights.map((insight) => (
          <Card key={insight.id} hover padding="lg">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl ${colorMap[insight.type].bg} flex items-center justify-center ${colorMap[insight.type].text} flex-shrink-0`}>
                {iconMap[insight.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-dark">{insight.title}</h3>
                  {insight.isEstimate && (
                    <Badge variant="warning" size="sm">Estimate</Badge>
                  )}
                </div>
                <p className="text-sm text-muted mb-3">{insight.description}</p>
                {insight.potentialAmount && insight.potentialAmount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">Potential impact:</span>
                    <span className="text-sm font-semibold text-dark">{formatCurrency(insight.potentialAmount)}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
