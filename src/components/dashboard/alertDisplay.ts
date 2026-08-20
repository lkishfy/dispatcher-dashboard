import type { DriverSummary } from '../../domain/hos'

export function getViolationSummary(summary: DriverSummary): string {
  if (summary.driveMinutesRemaining === null) return 'Over limit'

  const over = Math.abs(summary.driveMinutesRemaining)
  const hours = Math.floor(over / 60)
  const remainingMinutes = over % 60
  const formatted = hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`
  return `${formatted} over limit`
}
