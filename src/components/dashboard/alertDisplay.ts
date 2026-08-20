import { formatDuration, type DriverSummary } from '../../domain/hos'

export function getViolationSummary(summary: DriverSummary): string {
  if (summary.driveMinutesRemaining === null) return 'Over limit'

  return `${formatDuration(summary.driveMinutesRemaining)} limit`
}
