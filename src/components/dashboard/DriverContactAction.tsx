import { Phone } from 'lucide-react'
import type { DriverSummary } from '../../domain/hos'
import { getDriverPhone } from '../../utils/driverContact'

interface DriverContactActionProps {
  summary: DriverSummary
  isExpanded?: boolean
}

export function DriverContactAction({
  summary,
  isExpanded = false,
}: DriverContactActionProps) {
  const buttonStyle = summary.severity === 'violation'
    ? 'hex-btn-critical'
    : 'hex-btn-secondary'

  return (
    <a
      href={`tel:${getDriverPhone(summary.driver.id).replace(/\D/g, '')}`}
      className={`${buttonStyle} hex-btn-sm h-9 ${isExpanded ? 'flex-1' : ''}`}
      aria-label={`Call ${summary.driver.name}`}
    >
      <Phone aria-hidden="true" size={14} />
      Call
    </a>
  )
}
