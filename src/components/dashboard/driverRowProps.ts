import type { DriverSummary } from '../../domain/hos'

export interface DriverRowProps {
  summary: DriverSummary
  isSelected: boolean
  isSelectionLocked: boolean
  isNudged: boolean
  onToggleSelect: (driverId: string) => void
  onOpenDriver: (driverId: string) => void
  onRequestNudge: (summary: DriverSummary) => void
}
