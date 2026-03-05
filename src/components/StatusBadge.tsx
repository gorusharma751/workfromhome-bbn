import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "pending" | "approved" | "rejected" | "paid" | "active" | "paused" | "completed";
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  pending: { label: "Pending", classes: "bg-warning/15 text-warning border-warning/30" },
  approved: { label: "Approved", classes: "bg-success/15 text-success border-success/30" },
  rejected: { label: "Rejected", classes: "bg-destructive/15 text-destructive border-destructive/30" },
  paid: { label: "Paid", classes: "bg-secondary/15 text-secondary border-secondary/30" },
  active: { label: "Active", classes: "bg-success/15 text-success border-success/30" },
  paused: { label: "Paused", classes: "bg-warning/15 text-warning border-warning/30" },
  completed: { label: "Completed", classes: "bg-muted text-muted-foreground border-border" },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", config.classes)}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
