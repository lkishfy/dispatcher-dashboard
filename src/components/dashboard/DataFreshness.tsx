import type { DriverSummary } from '../../domain/hos'
import { freshnessDotStyles, freshnessLabels } from './display'

interface DataFreshnessProps {
  summary: DriverSummary
}

export function DataFreshness({ summary }: DataFreshnessProps) {
  const updatedMinutes = summary.driver.telemetry.lastUpdatedMinutesAgo

  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-medium text-hex-ink">
        <span
          className={`size-2 rounded-full ${freshnessDotStyles[summary.freshness]}`}
          aria-hidden="true"
        />
        {freshnessLabels[summary.freshness]}
      </p>
      <p className="mt-0.5 text-xs text-hex-muted">
        {updatedMinutes === null ? 'Never reported' : `Updated ${updatedMinutes}m ago`}
      </p>
    </div>
  )
}
