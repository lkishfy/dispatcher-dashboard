import { useId } from 'react'
import type { DriverSummary } from '../../domain/hos'
import { AccessibleDialog } from '../ui/AccessibleDialog'

interface DismissViolationDialogProps {
  summary: DriverSummary
  onConfirm: (driverId: string) => void
  onClose: () => void
}

export function DismissViolationDialog({
  summary,
  onConfirm,
  onClose,
}: DismissViolationDialogProps) {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <AccessibleDialog
      labelledBy={titleId}
      describedBy={descriptionId}
      onClose={onClose}
      className="z-50"
    >
      <div className="grid h-full place-items-center p-4">
        <section className="w-full max-w-md rounded-dialog bg-white shadow-dialog">
          <header className="border-b border-hex-border px-5 py-4">
            <h2 id={titleId} className="font-semibold text-hex-ink">
              Dismiss this violation?
            </h2>
            <p id={descriptionId} className="mt-1 text-sm text-hex-muted">
              {summary.driver.name} will be removed from the violation banner,
              but remains visible in Driver Board.
            </p>
          </header>
          <div className="flex justify-end gap-2 px-5 py-4">
            <button type="button" onClick={onClose} className="hex-btn-secondary min-h-10">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(summary.driver.id)}
              className="hex-btn-primary min-h-10"
            >
              Confirm dismissal
            </button>
          </div>
        </section>
      </div>
    </AccessibleDialog>
  )
}
