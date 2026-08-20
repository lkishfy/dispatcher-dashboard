import { CloudOff } from 'lucide-react'
import {
  formatDuration,
  getRouteOverageMinutes,
  type DriverSummary,
} from '../../domain/hos'
import { severityDotStyles, severityLabels, statusLabels } from './display'

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

  const routeGap = getRouteOverageMinutes(summary)

  return (
    <div className="min-w-0">
      <p className="flex items-center gap-2 text-sm font-semibold tabular-nums text-hex-ink">
        <span className={`size-2.5 shrink-0 rounded-full ${severityDotStyles[summary.severity]}`} aria-hidden="true" />
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
