import { Phone } from 'lucide-react'
import type { DriverSummary } from '../../domain/hos'
import { getDriverTelHref } from '../../utils/driverContact'

interface DriverContactActionProps {
  summary: DriverSummary
  size?: 'compact' | 'default'
  className?: string
}

export function DriverContactAction({
  summary,
  size = 'default',
  className = '',
}: DriverContactActionProps) {
  const buttonStyle = summary.severity === 'violation'
    ? 'hex-btn-critical'
    : 'hex-btn-secondary'

  return (
    <a
      href={getDriverTelHref(summary.driver.id)}
      className={`${buttonStyle} hex-btn-sm ${size === 'compact' ? '' : 'h-9'} ${className}`}
      aria-label={`Call ${summary.driver.name}`}
    >
      <Phone aria-hidden="true" size={14} />
      Call
    </a>
  )
}
