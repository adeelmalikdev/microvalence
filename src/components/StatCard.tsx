import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  iconColor?: string;
}

export function StatCard({ title, value, icon: Icon, trend, iconColor = "text-primary" }: StatCardProps) {
  return (
    <Card className="glass-light hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{value}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {trend && (
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                trend.positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              }`}>
                {trend.value}
              </span>
            )}
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
