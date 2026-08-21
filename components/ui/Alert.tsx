import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "error";
  className?: string;
}

export function Alert({ title, children, variant = "info", className }: AlertProps) {
  const variants = {
    info: {
      container: "bg-accent-light border-accent/20",
      icon: <Info className="h-5 w-5 text-accent" />,
      title: "text-accent",
    },
    success: {
      container: "bg-success-light border-success/20",
      icon: <CheckCircle className="h-5 w-5 text-success" />,
      title: "text-success",
    },
    warning: {
      container: "bg-warning-light border-warning/20",
      icon: <AlertCircle className="h-5 w-5 text-warning" />,
      title: "text-warning",
    },
    error: {
      container: "bg-danger-light border-danger/20",
      icon: <XCircle className="h-5 w-5 text-danger" />,
      title: "text-danger",
    },
  };

  const config = variants[variant];

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-xl border",
        config.container,
        className
      )}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1">
        {title && (
          <h3 className={cn("font-semibold mb-1", config.title)}>{title}</h3>
        )}
        <div className="text-sm text-dark/80">{children}</div>
      </div>
    </div>
  );
}
