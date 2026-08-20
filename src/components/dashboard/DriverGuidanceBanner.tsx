import { AlertOctagon, ShieldAlert } from 'lucide-react'
import {
  formatDuration,
  getNextLegalAction,
  getRouteOverageMinutes,
  type DriverSummary,
} from '../../domain/hos'
import { DriverContactActions } from './DriverContactActions'
import { severityStyles } from './display'

interface DriverGuidanceBannerProps {
  summary: DriverSummary
}

export function DriverGuidanceBanner({ summary }: DriverGuidanceBannerProps) {
  const routeOverage = getRouteOverageMinutes(summary)
  const guidanceDetail = routeOverage !== null && summary.route
    ? `Current route requires ${formatDuration(summary.route.estimatedDriveMinutesRemaining)} of driving, exceeding available time by ${routeOverage}m.`
    : 'This guidance is calculated from today’s duty log and the 11-hour drive limit.'

  return (
    <section className={`rounded-xl border p-4 ${
      summary.severity === 'normal'
        ? 'border-hex-border bg-hex-bg text-hex-ink'
        : severityStyles[summary.severity]
    }`}>
      <div className="flex items-start gap-3">
        {summary.severity === 'violation'
          ? <AlertOctagon aria-hidden="true" className="mt-0.5 shrink-0" size={20} />
          : <ShieldAlert aria-hidden="true" className="mt-0.5 shrink-0" size={20} />}
        <div>
          <p className="font-semibold">{getNextLegalAction(summary)}</p>
          <p className="mt-1 text-sm opacity-80">{guidanceDetail}</p>
          {summary.severity === 'violation' && summary.driver.status === 'driving' && (
            <DriverContactActions
              driverId={summary.driver.id}
              driverName={summary.driver.name}
              online={summary.driver.telemetry.online}
            />
          )}
        </div>
      </div>
    </section>
  )
}
