import { Truck } from 'lucide-react'
import { formatDuration, type DriverSummary } from '../../domain/hos'
import { hexAvatar } from './hexStyles'

interface ReassignmentCandidatesProps {
  summary: DriverSummary
  candidates: DriverSummary[]
  onStage: (fromDriverId: string, toDriverId: string) => void
}

export function ReassignmentCandidates({
  summary,
  candidates,
  onStage,
}: ReassignmentCandidatesProps) {
  if (candidates.length === 0) {
    return (
      <p className="mt-4 rounded-lg border border-dashed border-hex-border bg-hex-bg p-4 text-sm text-hex-muted">
        No eligible drivers are currently available for reassignment.
      </p>
    )
  }

  return (
    <div className="mt-4 space-y-2">
      {candidates.slice(0, 3).map((candidate) => (
        <div
          key={candidate.driver.id}
          className="flex flex-col gap-3 rounded-lg border border-hex-border p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className={`${hexAvatar} size-9 shrink-0 rounded-full`}>
              {candidate.driver.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-hex-ink">{candidate.driver.name}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-hex-muted">
                <Truck aria-hidden="true" size={13} />
                {candidate.truck.unitNumber} · {candidate.driver.distanceFromHubMiles} mi
                away · {formatDuration(candidate.driveMinutesRemaining)} left
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onStage(summary.driver.id, candidate.driver.id)}
            disabled={!summary.route}
            className="hex-btn-primary min-h-10 w-full shrink-0 px-3 py-2 text-xs sm:w-auto"
          >
            Stage transfer
          </button>
        </div>
      ))}
    </div>
  )
}
