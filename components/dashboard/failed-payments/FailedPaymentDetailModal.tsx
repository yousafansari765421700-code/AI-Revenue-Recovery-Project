"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, Calendar, DollarSign, FileText, Mail, User, Building, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import type { FailedPaymentDetail } from "@/lib/data/failed-payments/client";

interface FailedPaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: FailedPaymentDetail | null;
  onStartRecovery: () => void;
  isRecovering: boolean;
}

const statusVariant: Record<string, "warning" | "primary" | "success" | "danger" | "neutral"> = {
  pending: "warning",
  in_progress: "primary",
  recovered: "success",
  failed: "danger",
};

const actionStatusIcon: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4 text-warning" />,
  executed: <CheckCircle className="w-4 h-4 text-success" />,
  failed: <XCircle className="w-4 h-4 text-danger" />,
  cancelled: <XCircle className="w-4 h-4 text-muted" />,
};

export default function FailedPaymentDetailModal({
  isOpen,
  onClose,
  payment,
  onStartRecovery,
  isRecovering,
}: FailedPaymentDetailModalProps) {
  if (!payment) return null;

  const formatCurrency = (value: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatStatus = (status: string) => {
    return status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const getRecommendedAction = () => {
    switch (payment.recovery_status) {
      case "pending":
        return "Initiate automated payment retry via email reminder and payment link";
      case "in_progress":
        return "Continue recovery workflow - follow up with customer and offer alternative payment methods";
      case "recovered":
        return "Recovery completed successfully";
      case "failed":
        return "Consider manual outreach or write off as bad debt";
      default:
        return "Review and determine next steps";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Failed Payment Details" size="lg">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted mb-1">Payment Amount</p>
            <p className="text-3xl font-bold text-dark">{formatCurrency(payment.amount, payment.invoice_currency)}</p>
          </div>
          <Badge variant={statusVariant[payment.recovery_status] || "neutral"} size="md">
            {formatStatus(payment.recovery_status)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-dark mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Information
              </h4>
              <div className="space-y-2 pl-6">
                <p className="text-sm"><span className="text-muted">Name:</span> <span className="text-dark font-medium">{payment.customer_name}</span></p>
                <p className="text-sm"><span className="text-muted">Email:</span> <span className="text-dark">{payment.customer_email}</span></p>
                {payment.customer_company && (
                  <p className="text-sm"><span className="text-muted">Company:</span> <span className="text-dark">{payment.customer_company}</span></p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-dark mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Invoice Information
              </h4>
              <div className="space-y-2 pl-6">
                <p className="text-sm"><span className="text-muted">Invoice:</span> <span className="text-dark font-medium">{payment.invoice_number}</span></p>
                <p className="text-sm"><span className="text-muted">Amount:</span> <span className="text-dark">{formatCurrency(payment.amount, payment.invoice_currency)}</span></p>
                {payment.invoice_due_date && (
                  <p className="text-sm"><span className="text-muted">Due Date:</span> <span className="text-dark">{format(new Date(payment.invoice_due_date), "MMM d, yyyy")}</span></p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-dark mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Failure Details
              </h4>
              <div className="space-y-2 pl-6">
                <p className="text-sm"><span className="text-muted">Reason:</span> <span className="text-dark">{payment.failure_reason || "Not specified"}</span></p>
                <p className="text-sm"><span className="text-muted">Detected:</span> <span className="text-dark">{format(new Date(payment.detected_at), "MMM d, yyyy 'at' h:mm a")}</span></p>
                {payment.recovered_at && (
                  <p className="text-sm"><span className="text-muted">Recovered:</span> <span className="text-dark">{format(new Date(payment.recovered_at), "MMM d, yyyy 'at' h:mm a")}</span></p>
                )}
              </div>
            </div>

            <div className="p-4 bg-background rounded-xl">
              <h4 className="text-sm font-semibold text-dark mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Recommended Action
              </h4>
              <p className="text-sm text-muted">{getRecommendedAction()}</p>
            </div>
          </div>
        </div>

        {payment.recovery_actions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-dark mb-3">Recovery History</h4>
            <div className="space-y-2">
              {payment.recovery_actions.map((action: { id: string; action_type: string; status: string; executed_at: string | null; created_at: string }) => (
                <div key={action.id} className="flex items-center justify-between p-3 bg-background rounded-xl">
                  <div className="flex items-center gap-3">
                    {actionStatusIcon[action.status] || <Clock className="w-4 h-4 text-muted" />}
                    <div>
                      <p className="text-sm font-medium text-dark">{formatStatus(action.action_type)}</p>
                      <p className="text-xs text-muted">{formatStatus(action.status)}</p>
                    </div>
                  </div>
                  {action.executed_at && (
                    <p className="text-xs text-muted">{format(new Date(action.executed_at), "MMM d, yyyy")}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {payment.recovery_status === "pending" && (
            <Button onClick={onStartRecovery} isLoading={isRecovering}>
              Start Recovery
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
