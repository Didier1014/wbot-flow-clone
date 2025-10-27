import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    trend: "up" | "down";
  };
  className?: string;
}

export function MetricCard({ title, value, icon: Icon, change, className }: MetricCardProps) {
  return (
    <Card className={cn("hover-elevate", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-mono" data-testid={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </div>
        {change && (
          <p className={cn(
            "text-xs mt-2 flex items-center gap-1",
            change.trend === "up" ? "text-status-online" : "text-status-busy"
          )}>
            <span>{change.trend === "up" ? "↑" : "↓"}</span>
            <span>{Math.abs(change.value)}%</span>
            <span className="text-muted-foreground">vs mês anterior</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
