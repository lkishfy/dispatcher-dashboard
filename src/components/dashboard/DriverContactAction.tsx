import { Phone } from 'lucide-react'
import type { DriverSummary } from '../../domain/hos'
import { getDriverTelHref } from '../../utils/driverContact'

interface DriverContactActionProps {
  summary: DriverSummary
  isExpanded?: boolean
  compact?: boolean
}

export function DriverContactAction({
  summary,
  isExpanded = false,
  compact = false,
}: DriverContactActionProps) {
  const buttonStyle = summary.severity === 'violation'
    ? 'hex-btn-critical'
    : 'hex-btn-secondary'

  return (
    <a
      href={getDriverTelHref(summary.driver.id)}
      className={`${buttonStyle} hex-btn-sm ${compact ? 'min-w-20' : 'h-9'} ${isExpanded ? 'flex-1' : ''}`}
      aria-label={`Call ${summary.driver.name}`}
    >
      <Phone aria-hidden="true" size={14} />
      Call
    </a>
  )
}
