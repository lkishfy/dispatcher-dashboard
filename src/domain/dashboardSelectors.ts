import { isViolation, type DriverSummary } from './hos'

export function getVisibleViolations(
  summaries: DriverSummary[],
  dismissedIds: Set<string>,
): DriverSummary[] {
  return summaries.filter(
    (summary) => isViolation(summary) && !dismissedIds.has(summary.driver.id),
  )
}

export function getHosAlertDrivers(
  summaries: DriverSummary[],
): DriverSummary[] {
  return summaries.filter(
    (summary) => summary.severity === 'critical' || summary.severity === 'warning',
  )
}

function needsVerification(summary: DriverSummary): boolean {
  return !isViolation(summary)
    && (
      summary.route === null
      || summary.driveMinutesRemaining === null
      || summary.freshness !== 'live'
    )
}

export function getVerificationReason(summary: DriverSummary): string {
  const lastUpdate = summary.driver.telemetry.lastUpdatedMinutesAgo

  if (summary.driveMinutesRemaining === null) return 'HOS data unavailable'
  if (summary.freshness === 'offline') {
    return lastUpdate === null
      ? 'Driver offline'
      : `Driver offline · last update ${lastUpdate}m ago`
  }
  if (summary.route === null) return 'No active route assigned'
  return 'Telemetry requires verification'
}

export function getVisibleVerificationDrivers(
  summaries: DriverSummary[],
  dismissedIds: Set<string>,
): DriverSummary[] {
  return summaries.filter(
    (summary) => needsVerification(summary) && !dismissedIds.has(summary.driver.id),
  )
}

export function getExcludedReplacementIds(
  selectedIds: Set<string>,
  staged: Record<string, string>,
  confirmed: Record<string, string>,
): Set<string> {
  return new Set([
    ...selectedIds,
    ...Object.values(staged),
    ...Object.values(confirmed),
  ])
}

export function getLockedDriverIds(
  staged: Record<string, string>,
  confirmed: Record<string, string>,
): Set<string> {
  return new Set([...Object.keys(staged), ...Object.keys(confirmed)])
}

export function indexSummaries(
  summaries: DriverSummary[],
): Map<string, DriverSummary> {
  return new Map(summaries.map((summary) => [summary.driver.id, summary]))
}
