import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ children, className, hover = false, padding = "md" }: CardProps) {
  const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-border shadow-sm transition-all duration-300",
        hover && "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
