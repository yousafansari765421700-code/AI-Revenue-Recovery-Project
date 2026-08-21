import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({ trigger, children, align = "right", className }: DropdownProps) {
  return (
    <div className={cn("relative inline-block", className)}>
      <div className="cursor-pointer">{trigger}</div>
      <div
        className={cn(
          "absolute top-full mt-2 bg-white rounded-xl border border-border shadow-lg py-1.5 z-50 min-w-[200px] hidden group-hover:block",
          align === "right" && "right-0",
          align === "left" && "left-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
}

export function DropdownItem({ children, onClick, icon, danger = false }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors",
        danger
          ? "text-danger hover:bg-danger-light"
          : "text-dark hover:bg-gray-50"
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
