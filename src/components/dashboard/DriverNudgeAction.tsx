import { BellRing, Check } from 'lucide-react'
import type { DriverSummary } from '../../domain/hos'

interface DriverNudgeActionProps {
  summary: DriverSummary
  isNudged: boolean
  className?: string
  onRequestNudge: (summary: DriverSummary) => void
}

export function DriverNudgeAction({
  summary,
  isNudged,
  className = '',
  onRequestNudge,
}: DriverNudgeActionProps) {
  return (
    <button
      type="button"
      onClick={() => onRequestNudge(summary)}
      disabled={!summary.driver.telemetry.online || isNudged}
      title={summary.driver.telemetry.online ? undefined : 'Driver is offline'}
      className={`hex-btn-secondary hex-btn-sm h-9 ${className}`}
    >
      {isNudged
        ? <Check aria-hidden="true" size={14} />
        : <BellRing aria-hidden="true" size={14} />}
      {isNudged ? 'Nudged' : 'Nudge'}
    </button>
  )
}
