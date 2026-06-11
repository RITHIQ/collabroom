/**
 * StatusBadge — maps a status string to a colored pill badge.
 * Covers campaign statuses, application statuses, user states, etc.
 */

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusMap: Record<string, { cls: string; label: string }> = {
  // Campaign statuses
  active:       { cls: 'badge-success',  label: 'Active' },
  live:         { cls: 'badge-success',  label: 'Live' },
  in_progress:  { cls: 'badge-info',     label: 'In Progress' },
  completed:    { cls: 'badge-primary',  label: 'Completed' },
  draft:        { cls: 'badge-muted',    label: 'Draft' },
  cancelled:    { cls: 'badge-danger',   label: 'Cancelled' },
  paused:       { cls: 'badge-warning',  label: 'Paused' },
  closed:       { cls: 'badge-danger',   label: 'Closed' },

  // Application statuses
  pending:      { cls: 'badge-warning',  label: 'Pending' },
  approved:     { cls: 'badge-success',  label: 'Approved' },
  rejected:     { cls: 'badge-danger',   label: 'Rejected' },
  shortlisted:  { cls: 'badge-info',     label: 'Shortlisted' },
  under_review: { cls: 'badge-warning',  label: 'Under Review' },

  // User statuses
  verified:     { cls: 'badge-success',  label: 'Verified' },
  blocked:      { cls: 'badge-danger',   label: 'Blocked' },
  open:         { cls: 'badge-warning',  label: 'Open' },
  resolved:     { cls: 'badge-success',  label: 'Resolved' },
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const key = status?.toLowerCase().replace(/\s+/g, '_') ?? '';
  const mapped = statusMap[key];
  const cls = mapped?.cls ?? 'badge-muted';
  const label = mapped?.label ?? (status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '—');

  return (
    <span className={`badge ${cls} ${className}`}>
      {label}
    </span>
  );
}
