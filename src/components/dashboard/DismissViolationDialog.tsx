import type { DriverSummary } from '../../domain/hos'
import { ConfirmDialog } from '../ui/ConfirmDialog'

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
  return (
    <ConfirmDialog
      title="Dismiss this violation?"
      description={`${summary.driver.name} will be removed from alerts, but remains visible in Driver Board.`}
      confirmLabel="Confirm dismissal"
      onConfirm={() => onConfirm(summary.driver.id)}
      onClose={onClose}
    />
  )
}
