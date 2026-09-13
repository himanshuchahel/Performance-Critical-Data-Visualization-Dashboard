import type { DatasetStatus } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface DatasetStatusBadgeProps {
  status: DatasetStatus;
}

export function DatasetStatusBadge({ status }: DatasetStatusBadgeProps) {
  const variants = {
    Ready: {
      variant: "default" as const,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
      icon: CheckCircle2,
    },
    Processing: {
      variant: "default" as const,
      className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
      icon: Clock,
    },
    Failed: {
      variant: "destructive" as const,
      className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
      icon: XCircle,
    },
  };

  const config = variants[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {status}
    </Badge>
  );
}
