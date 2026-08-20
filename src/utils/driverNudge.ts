import {
  formatDuration,
  getRouteOverageMinutes,
  type DriverSummary,
} from '../domain/hos'

export function getDriverNudgeMessage(summary: DriverSummary): string {
  if (summary.severity === 'violation') {
    return 'You are over your HOS drive limit. Stop driving when safe and contact dispatch immediately.'
  }
  const overage = getRouteOverageMinutes(summary)
  if (overage !== null) {
    return `Your current route is projected to exceed available HOS by ${overage} minutes. Contact dispatch for reassignment.`
  }
  return `You have ${formatDuration(summary.driveMinutesRemaining)} of drive time remaining. Please confirm receipt.`
}
