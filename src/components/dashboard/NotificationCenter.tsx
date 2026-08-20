import {
  AlertOctagon,
  Bell,
  Clock3,
  Phone,
  TriangleAlert,
  X,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { getVerificationReason } from '../../domain/dashboardSelectors'
import { formatDuration, type DriverSummary } from '../../domain/hos'
import { getDriverPhone } from '../../utils/driverContact'
import { DismissViolationDialog } from './DismissViolationDialog'
import { getViolationSummary } from './alertDisplay'

type NotificationKind = 'violation' | 'hos' | 'verification'
type NotificationFilter = 'all' | NotificationKind

interface NotificationItem {
  id: string
  kind: NotificationKind
  summary: DriverSummary
}

export interface NotificationCenterProps {
  violations: DriverSummary[]
  hosAlerts: DriverSummary[]
  verificationDrivers: DriverSummary[]
  onDismissViolation: (driverId: string) => void
  onDismissVerification: (driverId: string) => void
  onOpenDriver: (driverId: string) => void
  onReassign: (driverId: string) => void
  headerAction?: ReactNode
  className?: string
}

const INITIAL_VISIBLE_COUNT = 6

const kindStyles: Record<NotificationKind, {
  icon: ReactNode
  iconClassName: string
  label: string
  badgeClassName: string
}> = {
  violation: {
    icon: <AlertOctagon aria-hidden="true" size={15} />,
    iconClassName: 'border-risk-critical-border bg-risk-critical-surface text-risk-critical',
    label: 'Active violation',
    badgeClassName: 'border-risk-critical-border bg-risk-critical-surface text-risk-critical',
  },
  hos: {
    icon: <Clock3 aria-hidden="true" size={15} />,
    iconClassName: 'border-warning-border bg-warning-surface text-warning-text',
    label: 'HOS alert',
    badgeClassName: 'border-warning-border bg-warning-surface text-warning-text',
  },
  verification: {
    icon: <TriangleAlert aria-hidden="true" size={15} />,
    iconClassName: 'border-hex-border bg-hex-bg text-hex-muted',
    label: 'Needs verification',
    badgeClassName: 'border-hex-border bg-hex-bg text-hex-muted',
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

export function NotificationCenter({
  violations,
  hosAlerts,
  verificationDrivers,
  onDismissViolation,
  onDismissVerification,
  onOpenDriver,
  onReassign,
  headerAction,
  className = '',
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [showAll, setShowAll] = useState(false)
  const [pendingDismissal, setPendingDismissal] = useState<DriverSummary | null>(null)
  const notifications: NotificationItem[] = [
    ...violations.map((summary) => ({
      id: `violation:${summary.driver.id}`,
      kind: 'violation' as const,
      summary,
    })),
    ...hosAlerts.map((summary) => ({
      id: `hos:${summary.driver.id}`,
      kind: 'hos' as const,
      summary,
    })),
    ...verificationDrivers.map((summary) => ({
      id: `verification:${summary.driver.id}`,
      kind: 'verification' as const,
      summary,
    })),
  ]

  if (notifications.length === 0) return null

  const counts: Record<NotificationFilter, number> = {
    all: notifications.length,
    violation: violations.length,
    hos: hosAlerts.length,
    verification: verificationDrivers.length,
  }
  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter((notification) => notification.kind === filter)
  const visibleNotifications = showAll
    ? filteredNotifications
    : filteredNotifications.slice(0, INITIAL_VISIBLE_COUNT)
  const hiddenCount = filteredNotifications.length - visibleNotifications.length
  const filters: Array<{ value: NotificationFilter; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'violation', label: 'Critical' },
    { value: 'hos', label: 'HOS' },
    { value: 'verification', label: 'Verify' },
  ]

  return (
    <>
      <section aria-labelledby="alerts-sidebar-title" className={`overflow-hidden border border-hex-border bg-white ${className}`}>
        <header className="border-b border-hex-border px-4 py-4 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center bg-hex-ink text-white">
              <Bell aria-hidden="true" size={17} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="alerts-sidebar-title" className="font-semibold text-hex-ink">
                  Alerts
                </h2>
                <span className="bg-hex-bg px-2 py-0.5 text-[11px] font-semibold tabular-nums text-hex-muted">
                  {notifications.length}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-hex-muted">
                Prioritized alerts requiring dispatcher attention
              </p>
            </div>
          </div>
            {headerAction}
          </div>
          <div role="group" aria-label="Filter alerts" className="mt-4 grid grid-cols-4 border border-hex-border bg-hex-bg">
              {filters.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={filter === option.value}
                  onClick={() => {
                    setFilter(option.value)
                    setShowAll(false)
                  }}
                  className={`min-h-9 border-r border-hex-border px-2 text-xs font-medium transition-colors last:border-r-0 ${
                    filter === option.value
                      ? 'bg-white text-hex-ink'
                      : 'text-hex-muted hover:text-hex-ink'
                  }`}
                >
                  {option.label} <span className="tabular-nums">{counts[option.value]}</span>
                </button>
              ))}
          </div>
        </header>

        <ul className="divide-y divide-hex-border">
          {visibleNotifications.map((item) => {
            const { summary } = item
            const style = kindStyles[item.kind]
            const phone = getDriverPhone(summary.driver.id).replace(/\D/g, '')
            const isViolation = item.kind === 'violation'

            return (
              <li key={item.id} className="px-4 py-3 sm:px-5">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 grid size-8 shrink-0 place-items-center border ${style.iconClassName}`}>
                    {style.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div>
                      <button
                        type="button"
                        onClick={() => onOpenDriver(summary.driver.id)}
                        className="text-left text-sm font-semibold text-hex-ink hover:underline"
                      >
                        {summary.driver.name}
                      </button>
                      <span className={`mt-1 block w-fit border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${style.badgeClassName}`}>
                        {style.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-hex-muted">
                      {getNotificationDetail(item)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <a
                        href={`tel:${phone}`}
                        aria-label={`Call ${summary.driver.name}`}
                        className={`${isViolation ? 'hex-btn-critical' : 'hex-btn-secondary'} hex-btn-sm min-w-20`}
                      >
                        <Phone aria-hidden="true" size={12} />
                        Call
                      </a>
                      {item.kind !== 'verification' && (
                        <button
                          type="button"
                          onClick={() => onReassign(summary.driver.id)}
                          disabled={!summary.route}
                          className="hex-btn-secondary hex-btn-sm min-w-20"
                        >
                          Reassign
                        </button>
                      )}
                    </div>
                  </div>
                  {(item.kind === 'violation' || item.kind === 'verification') && (
                    <button
                      type="button"
                      onClick={() => {
                        if (item.kind === 'violation') setPendingDismissal(summary)
                        else onDismissVerification(summary.driver.id)
                      }}
                      aria-label={`Dismiss ${style.label.toLowerCase()} for ${summary.driver.name}`}
                      className="grid size-8 shrink-0 place-items-center text-hex-muted hover:bg-hex-bg hover:text-hex-ink"
                    >
                      <X aria-hidden="true" size={14} />
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>

        {filteredNotifications.length > INITIAL_VISIBLE_COUNT && (
          <footer className="border-t border-hex-border px-4 py-3 text-center sm:px-5">
            <button
              type="button"
              onClick={() => setShowAll((current) => !current)}
              className="text-xs font-semibold text-hex-ink hover:underline"
            >
              {showAll
                ? 'Show fewer alerts'
                : `Show ${hiddenCount} more alert${hiddenCount === 1 ? '' : 's'}`}
            </button>
          </footer>
        )}
      </section>

      {pendingDismissal && (
        <DismissViolationDialog
          summary={pendingDismissal}
          onConfirm={(driverId) => {
            onDismissViolation(driverId)
            setPendingDismissal(null)
          }}
          onClose={() => setPendingDismissal(null)}
        />
      )}
    </>
  )
}
