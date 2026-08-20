import { CheckCircle2, RotateCcw } from 'lucide-react'
import type { DriverSummary } from '../../domain/hos'

interface ConfirmedReassignmentProps {
  summary: DriverSummary
  replacement: DriverSummary
  onUndo: (fromDriverId: string) => void
}

export function ConfirmedReassignment({
  summary,
  replacement,
  onUndo,
}: ConfirmedReassignmentProps) {
  return (
    <div className="mt-4 rounded-lg border border-success-border bg-success-surface p-4 text-success-text">
      <div className="flex items-start gap-3">
        <CheckCircle2 aria-hidden="true" size={19} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">Transfer confirmed for {replacement.driver.name}</p>
          <p className="mt-1 text-sm">
            {summary.route?.loadLabel} is assigned to {replacement.truck.unitNumber}.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onUndo(summary.driver.id)}
        className="hex-btn-secondary mt-4 min-h-10 px-3 text-sm"
      >
        <RotateCcw aria-hidden="true" size={14} />
        Undo transfer
      </button>
    </div>
  )
}
