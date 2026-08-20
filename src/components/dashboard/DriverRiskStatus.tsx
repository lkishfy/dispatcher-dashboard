import { CloudOff } from 'lucide-react'
import { formatDuration, type DriverSummary } from '../../domain/hos'
import { severityLabels, statusLabels } from './display'

interface DriverRiskStatusProps {
  summary: DriverSummary
}

export function DriverRiskStatus({ summary }: DriverRiskStatusProps) {
  if (summary.driveMinutesRemaining === null) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-hex-muted">
        <CloudOff aria-hidden="true" size={15} strokeWidth={1.75} />
        No HOS data
      </div>
    )
  }

  const riskDot = summary.severity === 'violation'
    ? 'bg-risk-critical'
    : summary.severity === 'critical'
      ? 'bg-risk-high'
      : summary.severity === 'warning'
        ? 'bg-risk-medium'
        : 'bg-success-text'
  const routeGap = summary.projectedOverLimit && summary.route
    ? summary.route.estimatedDriveMinutesRemaining - summary.driveMinutesRemaining
    : null

  return (
    <div className="min-w-0">
      <p className="flex items-center gap-2 text-sm font-semibold tabular-nums text-hex-ink">
        <span className={`size-2.5 shrink-0 rounded-full ${riskDot}`} aria-hidden="true" />
        {formatDuration(summary.driveMinutesRemaining)}
        {summary.driveMinutesRemaining > 0 ? ' remaining' : ''}
      </p>
      <p className="mt-1 text-xs text-hex-muted">
        {routeGap !== null
          ? `Route exceeds clock by ${routeGap}m`
          : `${severityLabels[summary.severity]} · ${statusLabels[summary.driver.status]}`}
      </p>
    </div>
  )
}
