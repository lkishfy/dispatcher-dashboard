import { useId } from 'react'
import type { DriverSummary } from '../../domain/hos'
import { getDriverNudgeMessage } from '../../utils/driverNudge'
import { AccessibleDialog } from '../ui/AccessibleDialog'

interface DriverNudgeDialogProps {
  summary: DriverSummary
  onConfirm: (driverId: string) => void
  onClose: () => void
}

export function DriverNudgeDialog({
  summary,
  onConfirm,
  onClose,
}: DriverNudgeDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const message = getDriverNudgeMessage(summary)

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
              Send nudge to {summary.driver.name}?
            </h2>
            <p id={descriptionId} className="mt-1 text-sm text-hex-muted">
              Review the in-cab message before sending.
            </p>
          </header>
          <div className="px-5 py-4">
            <p className="hex-label">Message to driver</p>
            <p className="mt-2 rounded-lg border border-hex-border bg-hex-bg p-3 text-sm leading-relaxed text-hex-ink">
              “{message}”
            </p>
          </div>
          <footer className="flex justify-end gap-2 border-t border-hex-border px-5 py-4">
            <button type="button" onClick={onClose} className="hex-btn-secondary min-h-10">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(summary.driver.id)}
              className="hex-btn-primary min-h-10"
            >
              Send nudge
            </button>
          </footer>
        </section>
      </div>
    </AccessibleDialog>
  )
}
