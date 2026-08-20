import type { DriverSummary } from '../../domain/hos'

interface StagedReassignmentProps {
  summary: DriverSummary
  replacement: DriverSummary
  onConfirm: (fromDriverId: string) => void
}

export function StagedReassignment({
  summary,
  replacement,
  onConfirm,
}: StagedReassignmentProps) {
  return (
    <div className="mt-4 rounded-lg border border-warning-border bg-warning-surface p-4 text-warning-text">
      <p className="font-semibold">Reassignment staged for {replacement.driver.name}</p>
      <p className="mt-1 text-sm">
        {summary.route?.loadLabel} will move to {replacement.truck.unitNumber}.
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
  )
}
