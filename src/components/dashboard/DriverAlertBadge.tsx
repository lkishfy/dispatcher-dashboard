import type { DriverSummary } from '../../domain/hos'
import { severityStyles } from './display'

interface DriverAlertBadgeProps {
  summary: DriverSummary
}

export function DriverAlertBadge({ summary }: DriverAlertBadgeProps) {
  const isViolation = summary.severity === 'violation'
  const isHosAlert = summary.severity === 'critical' || summary.severity === 'warning'
  const label = isViolation ? 'Violation' : isHosAlert ? 'HOS alert' : null

  if (!label) return null

  const badgeStyle = isViolation
    ? severityStyles.violation
    : 'border-warning-border bg-warning-surface text-warning-text'

  return (
    <span className={`mt-1 block w-fit border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${badgeStyle}`}>
      {label}
    </span>
  )
}
