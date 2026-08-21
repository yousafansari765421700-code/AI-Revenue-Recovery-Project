"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Mail, Phone, FileText, RefreshCw, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface TimelineEvent {
  id: string;
  action_type: string;
  status: string;
  executed_at: string | null;
  created_at: string;
  customer_name: string;
  detected_at: string;
}

interface RecoveryTimelineProps {
  events: TimelineEvent[];
}

const actionIcons: Record<string, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  sms: <FileText className="w-4 h-4" />,
  call: <Phone className="w-4 h-4" />,
  retry_payment: <RefreshCw className="w-4 h-4" />,
  offer_discount: <TrendingUp className="w-4 h-4" />,
};

const statusConfig: Record<string, { icon: React.ReactNode; variant: "success" | "warning" | "danger" | "neutral" | "primary"; label: string }> = {
  pending: { icon: <Clock className="w-4 h-4" />, variant: "warning", label: "Pending" },
  executed: { icon: <CheckCircle className="w-4 h-4" />, variant: "success", label: "Executed" },
  failed: { icon: <XCircle className="w-4 h-4" />, variant: "danger", label: "Failed" },
  cancelled: { icon: <XCircle className="w-4 h-4" />, variant: "neutral", label: "Cancelled" },
};

export default function RecoveryTimeline({ events }: RecoveryTimelineProps) {
  const formatStatus = (status: string) => {
    return status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  if (events.length === 0) {
    return (
      <Card padding="lg">
        <div className="text-center py-12">
          <p className="text-muted text-lg">No recovery activity yet</p>
          <p className="text-muted text-sm mt-2">Start a recovery workflow to see activity here</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-dark">Recovery Activity Timeline</h3>
        <p className="text-sm text-muted">Track all recovery actions and their outcomes</p>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-6">
          {events.map((event, index) => {
            const statusInfo = statusConfig[event.status] || statusConfig.pending;
            const isLast = index === events.length - 1;

            return (
              <div key={event.id} className="relative flex gap-4">
                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                  event.status === "executed" ? "bg-success-light text-success" :
                  event.status === "failed" ? "bg-danger-light text-danger" :
                  event.status === "cancelled" ? "bg-gray-100 text-muted" :
                  "bg-warning-light text-warning"
                }`}>
                  {actionIcons[event.action_type] || <Clock className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0 pb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-dark">{formatStatus(event.action_type)}</h4>
                        <Badge variant={statusInfo.variant} size="sm">{statusInfo.label}</Badge>
                      </div>
                      <p className="text-sm text-muted mb-1">
                        Customer: <span className="text-dark font-medium">{event.customer_name}</span>
                      </p>
                      <p className="text-xs text-muted">
                        Detected: {format(new Date(event.detected_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <div className="text-right">
                      {event.executed_at && (
                        <p className="text-xs text-muted">
                          Executed: {format(new Date(event.executed_at), "MMM d, yyyy")}
                        </p>
                      )}
                      <p className="text-xs text-muted mt-1">
                        Created: {format(new Date(event.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
