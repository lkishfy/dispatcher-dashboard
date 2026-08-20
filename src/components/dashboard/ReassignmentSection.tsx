import {
  ArrowRightLeft,
  CheckCircle2,
  RotateCcw,
  Truck,
} from 'lucide-react'
import { formatDuration, type DriverSummary } from '../../domain/hos'
import { hexAvatar } from './hexStyles'

interface ReassignmentSectionProps {
  summary: DriverSummary
  candidates: DriverSummary[]
  stagedReplacement: DriverSummary | null
  confirmedReplacement: DriverSummary | null
  onStage: (fromDriverId: string, toDriverId: string) => void
  onConfirm: (fromDriverId: string) => void
  onUndo: (fromDriverId: string) => void
}

export function ReassignmentSection({
  summary,
  candidates,
  stagedReplacement,
  confirmedReplacement,
  onStage,
  onConfirm,
  onUndo,
}: ReassignmentSectionProps) {
  return (
    <section className="hex-card p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <ArrowRightLeft aria-hidden="true" size={18} className="text-hex-muted" />
        <div>
          <h3 className="font-semibold text-hex-ink">Reassignment options</h3>
          <p className="text-xs text-hex-muted">
            Available drivers ranked by distance to the hub
          </p>
        </div>
      </div>
      {confirmedReplacement ? (
        <div className="mt-4 rounded-lg border border-success-border bg-success-surface p-4 text-success-text">
          <div className="flex items-start gap-3">
            <CheckCircle2 aria-hidden="true" size={19} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">
                Transfer confirmed for {confirmedReplacement.driver.name}
              </p>
              <p className="mt-1 text-sm">
                {summary.route?.loadLabel} is assigned to {confirmedReplacement.truck.unitNumber}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onUndo(summary.driver.id)}
            className="hex-btn-secondary mt-4 inline-flex min-h-10 items-center justify-center gap-1.5 px-3 text-sm"
          >
            <RotateCcw aria-hidden="true" size={14} />
            Undo transfer
          </button>
        </div>
      ) : stagedReplacement ? (
        <div className="mt-4 rounded-lg border border-warning-border bg-warning-surface p-4 text-warning-text">
          <p className="font-semibold">
            Reassignment staged for {stagedReplacement.driver.name}
          </p>
          <p className="mt-1 text-sm">
            {summary.route?.loadLabel} will move to {stagedReplacement.truck.unitNumber}.
            Confirm before dispatching.
          </p>
          <button
            type="button"
            onClick={() => onConfirm(summary.driver.id)}
            className="hex-btn-primary mt-4 min-h-10 w-full px-3 text-sm"
          >
            Confirm transfer
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {candidates.length === 0 ? (
            <p className="rounded-lg border border-dashed border-hex-border bg-hex-bg p-4 text-sm text-hex-muted">
              No eligible drivers are currently available for reassignment.
            </p>
          ) : (
            candidates.slice(0, 3).map((candidate) => (
              <div
                key={candidate.driver.id}
                className="flex flex-col gap-3 rounded-lg border border-hex-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`${hexAvatar} size-9 shrink-0 rounded-full`}>
                    {candidate.driver.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-hex-ink">
                      {candidate.driver.name}
                    </p>
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
            ))
          )}
        </div>
      )}
    </section>
  )
}
