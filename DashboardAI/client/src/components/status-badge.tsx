import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "active" | "pending" | "inactive" | "success" | "error";
  children: React.ReactNode;
  className?: string;
}

const statusStyles = {
  active: "bg-status-online/10 text-status-online border-status-online/20",
  pending: "bg-status-away/10 text-status-away border-status-away/20",
  inactive: "bg-status-offline/10 text-status-offline border-status-offline/20",
  success: "bg-status-online/10 text-status-online border-status-online/20",
  error: "bg-status-busy/10 text-status-busy border-status-busy/20",
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusStyles[status], "border", className)}
      data-testid={`badge-${status}`}
    >
      <span className="mr-1.5">●</span>
      {children}
    </Badge>
  );
}
