import { cn } from '@/lib/utils';

type StatusType = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED' | 'INACTIVE' | 'MAINTENANCE';

const statusStyles: Record<StatusType, string> = {
  ACTIVE: 'bg-success/10 text-success border-success/20',
  PENDING: 'bg-warning/10 text-warning border-warning/20',
  SUSPENDED: 'bg-destructive/10 text-destructive border-destructive/20',
  REJECTED: 'bg-destructive/10 text-destructive border-destructive/20',
  INACTIVE: 'bg-muted text-muted-foreground border-border',
  MAINTENANCE: 'bg-info/10 text-info border-info/20',
};

interface StatusBadgeProps {
  status: string;
  pulse?: boolean;
  className?: string;
}

export function StatusBadge({ status, pulse, className }: StatusBadgeProps) {
  const normalized = status.toUpperCase() as StatusType;
  const style = statusStyles[normalized] || statusStyles.INACTIVE;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        style,
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
      )}
      {status}
    </span>
  );
}
