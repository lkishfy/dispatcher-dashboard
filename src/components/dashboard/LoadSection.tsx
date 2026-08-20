import { MapPin, Package } from 'lucide-react'
import { formatDuration, type DriverSummary } from '../../domain/hos'

interface LoadSectionProps {
  summary: DriverSummary
}

export function LoadSection({ summary }: LoadSectionProps) {
  const completed = summary.route?.completedStops ?? 0
  const total = summary.route?.deliveryIds.length ?? 0
  const progress = total ? Math.round((completed / total) * 100) : 0

  return (
    <section className="hex-card p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Package aria-hidden="true" size={18} className="text-hex-muted" />
        <h3 className="font-semibold text-hex-ink">Load at risk</h3>
      </div>
      {summary.route ? (
        <>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-hex-ink">
                {summary.route.loadLabel} · {summary.currentDelivery?.customer}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-hex-muted">
                <MapPin aria-hidden="true" size={14} />
                {summary.route.origin} to {summary.route.destination}
              </p>
            </div>
            <p className="text-right text-sm font-semibold text-hex-ink">
              {summary.remainingStops} stops
              <br />
              <span className="text-xs font-normal text-hex-muted">remaining</span>
            </p>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-hex-muted">
              <span>{completed} completed</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-hex-border/30">
              <div
                className="h-full rounded-full bg-hex-ink"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-hex-bg p-3 text-sm">
            <div>
              <p className="text-xs text-hex-muted">Projected route time</p>
              <p className="mt-1 font-semibold text-hex-ink">
                {formatDuration(summary.route.projectedMinutesRemaining)}
              </p>
            </div>
            <div>
              <p className="text-xs text-hex-muted">Drive time needed</p>
              <p className="mt-1 font-semibold text-hex-ink">
                {formatDuration(summary.route.estimatedDriveMinutesRemaining)}
              </p>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-hex-muted">
          No active load is assigned to this driver.
        </p>
      )}
    </section>
  )
}
