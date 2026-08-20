import { Bell } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import type { DriverSummary } from '../../domain/hos'
import { DismissViolationDialog } from './DismissViolationDialog'
import {
  NotificationFilterBar,
  type NotificationFilter,
} from './NotificationFilterBar'
import {
  NotificationListItem,
  type NotificationItem,
} from './NotificationListItem'

export interface NotificationCenterProps {
  violations: DriverSummary[]
  hosAlerts: DriverSummary[]
  verificationDrivers: DriverSummary[]
  onDismissViolation: (driverId: string) => void
  onDismissVerification: (driverId: string) => void
  onOpenDriver: (driverId: string) => void
  headerAction?: ReactNode
  className?: string
}

const INITIAL_VISIBLE_COUNT = 6

function compareByHosUrgency(first: DriverSummary, second: DriverSummary): number {
  return (first.driveMinutesRemaining ?? Number.MAX_SAFE_INTEGER)
    - (second.driveMinutesRemaining ?? Number.MAX_SAFE_INTEGER)
}

export function NotificationCenter({
  violations,
  hosAlerts,
  verificationDrivers,
  onDismissViolation,
  onDismissVerification,
  onOpenDriver,
  headerAction,
  className = '',
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [view, setView] = useState<'preview' | 'full'>('preview')
  const [pendingDismissal, setPendingDismissal] = useState<DriverSummary | null>(null)
  const notifications = useMemo<NotificationItem[]>(() => [
    ...violations.toSorted(compareByHosUrgency).map((summary) => ({
      id: `violation:${summary.driver.id}`,
      kind: 'violation' as const,
      summary,
    })),
    ...hosAlerts.toSorted(compareByHosUrgency).map((summary) => ({
      id: `hos:${summary.driver.id}`,
      kind: 'hos' as const,
      summary,
    })),
    ...verificationDrivers.map((summary) => ({
      id: `verification:${summary.driver.id}`,
      kind: 'verification' as const,
      summary,
    })),
  ], [hosAlerts, verificationDrivers, violations])

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
  const visibleNotifications = view === 'full'
    ? filteredNotifications
    : filteredNotifications.slice(0, INITIAL_VISIBLE_COUNT)
  const hiddenCount = filteredNotifications.length - visibleNotifications.length

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
          <NotificationFilterBar
            selectedFilter={filter}
            counts={counts}
            onChange={(nextFilter) => {
              setFilter(nextFilter)
              setView('preview')
            }}
          />
        </header>

        {visibleNotifications.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-hex-muted">
            No alerts in this category.
          </p>
        ) : (
          <ul className="divide-y divide-hex-border">
            {visibleNotifications.map((item) => (
              <NotificationListItem
                key={item.id}
                item={item}
                onOpenDriver={onOpenDriver}
                onDismiss={(dismissedItem) => {
                  if (dismissedItem.kind === 'violation') {
                    setPendingDismissal(dismissedItem.summary)
                  } else {
                    onDismissVerification(dismissedItem.summary.driver.id)
                  }
                }}
              />
            ))}
          </ul>
        )}

        {filteredNotifications.length > INITIAL_VISIBLE_COUNT && (
          <footer className="border-t border-hex-border px-4 py-3 text-center sm:px-5">
            <button
              type="button"
              onClick={() => setView((current) => current === 'full' ? 'preview' : 'full')}
              className="text-xs font-semibold text-hex-ink hover:underline"
            >
              {view === 'full'
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
