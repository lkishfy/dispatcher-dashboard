import type { DriverSummary } from '../../domain/hos'
import { getDriverNudgeMessage } from '../../utils/driverNudge'
import { ConfirmDialog } from '../ui/ConfirmDialog'

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
  const message = getDriverNudgeMessage(summary)

  return (
    <ConfirmDialog
      title={`Send nudge to ${summary.driver.name}?`}
      description="Review the in-cab message before sending."
      confirmLabel="Send nudge"
      onConfirm={() => onConfirm(summary.driver.id)}
      onClose={onClose}
    >
      <div className="px-5 py-4">
        <p className="hex-label">Message to driver</p>
        <p className="mt-2 rounded-lg border border-hex-border bg-hex-bg p-3 text-sm leading-relaxed text-hex-ink">
          “{message}”
        </p>
      </div>
    </ConfirmDialog>
  )
}
