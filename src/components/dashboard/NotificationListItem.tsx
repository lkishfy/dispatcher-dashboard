import { AlertOctagon, Clock3, TriangleAlert, X, type LucideIcon } from 'lucide-react'
import { getVerificationReason } from '../../domain/dashboardSelectors'
import { formatDuration, type DriverSummary } from '../../domain/hos'
import { DriverContactAction } from './DriverContactAction'
import { getViolationSummary } from './alertDisplay'

export type NotificationKind = 'violation' | 'hos' | 'verification'

export interface NotificationItem {
  id: string
  kind: NotificationKind
  summary: DriverSummary
}

export interface NotificationReassignmentStatus {
  phase: 'staged' | 'confirmed'
  replacementName: string
  replacementTruck: string
}

const kindStyles: Record<NotificationKind, {
  Icon: LucideIcon
  className: string
  label: string
}> = {
  violation: {
    Icon: AlertOctagon,
    className: 'border-risk-critical-border bg-risk-critical-surface text-risk-critical',
    label: 'Violation',
  },
  hos: {
    Icon: Clock3,
    className: 'border-warning-border bg-warning-surface text-warning-text',
    label: 'HOS alert',
  },
  verification: {
    Icon: TriangleAlert,
    className: 'border-hex-border bg-hex-bg text-hex-muted',
    label: 'Needs verification',
  },
}

function getNotificationDetail(item: NotificationItem): string {
  const { kind, summary } = item
  if (kind === 'violation') {
    return [
      getViolationSummary(summary),
      summary.route?.loadLabel,
      summary.remainingStops > 0 ? `${summary.remainingStops} stops remaining` : null,
    ].filter(Boolean).join(' · ')
  }
  if (kind === 'hos') {
    return [
      `${formatDuration(summary.driveMinutesRemaining)} until 11-hour limit`,
      'Reset due at limit',
      summary.route?.loadLabel,
    ].filter(Boolean).join(' · ')
  }
  return getVerificationReason(summary)
}

interface NotificationListItemProps {
  item: NotificationItem
  reassignmentStatus?: NotificationReassignmentStatus
  onOpenDriver: (driverId: string) => void
  onReassignDriver: (driverId: string) => void
  onDismiss: (item: NotificationItem) => void
}

export function NotificationListItem({
  item,
  reassignmentStatus,
  onOpenDriver,
  onReassignDriver,
  onDismiss,
}: NotificationListItemProps) {
  const { summary } = item
  const style = kindStyles[item.kind]

  return (
    <li className="px-4 py-3 sm:px-5">
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 grid size-8 shrink-0 place-items-center border ${style.className}`}>
          <style.Icon aria-hidden="true" size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onOpenDriver(summary.driver.id)}
            className="text-left text-sm font-semibold text-hex-ink hover:underline"
          >
            {summary.driver.name}
          </button>
          <span className={`mt-1 block w-fit border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${style.className}`}>
            {style.label}
          </span>
          <p className="mt-0.5 text-xs leading-relaxed text-hex-muted">
            {getNotificationDetail(item)}
          </p>
          {reassignmentStatus && (
            <p className={`mt-2 text-xs font-medium ${
              reassignmentStatus.phase === 'confirmed'
                ? 'text-success-text'
                : 'text-warning-text'
            }`}>
              {reassignmentStatus.phase === 'confirmed' ? 'Reassigned' : 'Reassignment staged'} to{' '}
              {reassignmentStatus.replacementName} · {reassignmentStatus.replacementTruck}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <DriverContactAction summary={summary} size="compact" className="min-w-20" />
            {item.kind !== 'verification' && (
              reassignmentStatus?.phase === 'confirmed' ? (
                <span className="inline-flex min-h-8 items-center border border-success-border bg-success-surface px-3 text-xs font-semibold text-success-text">
                  Reassigned
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => reassignmentStatus
                    ? onOpenDriver(summary.driver.id)
                    : onReassignDriver(summary.driver.id)}
                  disabled={!summary.route}
                  className="hex-btn-secondary hex-btn-sm min-w-20"
                >
                  {reassignmentStatus ? 'Review & confirm' : 'Reassign'}
                </button>
              )
            )}
          </div>
        </div>
        {(item.kind === 'violation' || item.kind === 'verification') && (
          <button
            type="button"
            onClick={() => onDismiss(item)}
            aria-label={`Dismiss ${style.label.toLowerCase()} for ${summary.driver.name}`}
            className="grid size-8 shrink-0 place-items-center text-hex-muted hover:bg-hex-bg hover:text-hex-ink"
          >
            <X aria-hidden="true" size={14} />
          </button>
        )}
      </div>
    </li>
  )
}
