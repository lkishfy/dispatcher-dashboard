import type { DriverSummary } from './hos'
import { sortByUrgency } from './hos'

const HANDOFF_MINUTES_PER_MILE = 2
const HOS_RESERVE_MINUTES = 30

export function getAvailableDrivers(
  summaries: DriverSummary[],
  excludedDriverIds: Set<string>,
): DriverSummary[] {
  return summaries.filter((summary) => (
    !excludedDriverIds.has(summary.driver.id)
    && summary.driver.availableForReassignment
    && summary.truck.status === 'available'
    && summary.route === null
    && summary.freshness === 'live'
    && (summary.driveMinutesRemaining ?? 0) >= 120
  )).toSorted(
    (first, second) => first.driver.distanceFromHubMiles - second.driver.distanceFromHubMiles,
  )
}

function getRequiredDriveMinutes(load: DriverSummary, candidate: DriverSummary): number {
  const routeDriveMinutes = load.route?.estimatedDriveMinutesRemaining ?? 0
  const handoffMinutes = candidate.driver.distanceFromHubMiles * HANDOFF_MINUTES_PER_MILE
  return routeDriveMinutes + handoffMinutes + HOS_RESERVE_MINUTES
}

export function getReassignmentCandidates(
  load: DriverSummary,
  summaries: DriverSummary[],
  excludedDriverIds: Set<string> = new Set(),
): DriverSummary[] {
  if (!load.route) return []

  return getAvailableDrivers(summaries, excludedDriverIds)
    .filter((candidate) => (
      candidate.truck.type === load.truck.type
      && (candidate.driveMinutesRemaining ?? 0) >= getRequiredDriveMinutes(load, candidate)
    ))
    .toSorted((first, second) => {
      const firstAtDestination = first.driver.location === load.route?.destination ? 0 : 1
      const secondAtDestination = second.driver.location === load.route?.destination ? 0 : 1
      if (firstAtDestination !== secondAtDestination) {
        return firstAtDestination - secondAtDestination
      }

      const firstRequired = getRequiredDriveMinutes(load, first)
      const secondRequired = getRequiredDriveMinutes(load, second)
      const firstUtilization = firstRequired / (first.driveMinutesRemaining ?? 1)
      const secondUtilization = secondRequired / (second.driveMinutesRemaining ?? 1)
      if (firstUtilization !== secondUtilization) {
        return firstUtilization - secondUtilization
      }

      return first.driver.distanceFromHubMiles - second.driver.distanceFromHubMiles
    })
}

export function buildBatchReassignments(
  loadsToMove: DriverSummary[],
  availableDrivers: DriverSummary[],
): Record<string, string> {
  const assignments: Record<string, string> = {}
  const usedReplacementIds = new Set<string>()

  for (const load of sortByUrgency(loadsToMove)) {
    const replacement = getReassignmentCandidates(
      load,
      availableDrivers,
      usedReplacementIds,
    )[0]
    if (!replacement) continue

    assignments[load.driver.id] = replacement.driver.id
    usedReplacementIds.add(replacement.driver.id)
  }

  return assignments
}
