import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ className, label, error, icon, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-dark mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
            {icon}
          </div>
        )}
        <input
          className={cn(
            "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-dark placeholder:text-muted/60 transition-all duration-200",
            "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
            "disabled:bg-gray-50 disabled:cursor-not-allowed",
            error && "border-danger focus:border-danger focus:ring-danger/20",
            icon && "pl-10",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}
