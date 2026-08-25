import type {
  Delivery,
  Driver,
  DutyStatus,
  FleetData,
  Route,
  Truck,
} from '../types/fleet'

export const HOS_DRIVE_LIMIT_MINUTES = 11 * 60
export const HOS_RESET_MINUTES = 10 * 60
const HOS_WARNING_MINUTES = 90
const HOS_CRITICAL_MINUTES = 30

export const HOS_SEVERITIES = ['violation', 'critical', 'warning', 'normal', 'no-data'] as const
export const DATA_FRESHNESS_STATES = ['live', 'offline', 'no-data'] as const

export type HosSeverity = typeof HOS_SEVERITIES[number]
export type DataFreshness = typeof DATA_FRESHNESS_STATES[number]

export interface DriverSummary {
  driver: Driver
  truck: Truck
  route: Route | null
  currentDelivery: Delivery | null
  driveMinutesUsed: number | null
  driveMinutesRemaining: number | null
  severity: HosSeverity
  freshness: DataFreshness
  projectedOverLimit: boolean
  remainingStops: number
  legalStopTime: string | null
  resetMinutesRemaining: number | null
}

export interface DutyTimelineEntry {
  id: string
  label: string
  status: DutyStatus
  durationMinutes: number
  isCurrent: boolean
}

export function getDriveMinutesUsed(driver: Driver): number | null {
  if (driver.dutyLog === null) return null

  const completedDrivingMinutes = driver.dutyLog
    .filter((segment) => segment.status === 'driving')
    .reduce((total, segment) => total + segment.durationMinutes, 0)

  const currentDrivingMinutes = driver.status === 'driving'
    ? driver.currentStatusMinutes
    : 0

  return completedDrivingMinutes + currentDrivingMinutes
}

export function getDataFreshness(driver: Driver): DataFreshness {
  if (driver.telemetry.lastUpdatedMinutesAgo === null) return 'no-data'
  if (!driver.telemetry.online) return 'offline'
  return 'live'
}

export function getHosSeverity(
  driveMinutesRemaining: number | null,
  estimatedDriveMinutesRemaining: number,
): HosSeverity {
  if (driveMinutesRemaining === null) return 'no-data'
  if (driveMinutesRemaining <= 0) return 'violation'
  if (driveMinutesRemaining <= HOS_CRITICAL_MINUTES) return 'critical'
  if (
    driveMinutesRemaining <= HOS_WARNING_MINUTES
    || estimatedDriveMinutesRemaining > driveMinutesRemaining
  ) {
    return 'warning'
  }
  return 'normal'
}

function getLegalStopTime(
  snapshotTime: string,
  driver: Driver,
  driveMinutesRemaining: number | null,
): string | null {
  if (driveMinutesRemaining === null || driver.status !== 'driving') return null

  const stopTime = new Date(snapshotTime)
  stopTime.setMinutes(stopTime.getMinutes() + Math.max(0, driveMinutesRemaining))
  return stopTime.toISOString()
}

export function getResetMinutesRemaining(
  driver: Driver,
  driveMinutesRemaining: number | null,
): number | null {
  if (driveMinutesRemaining === null) return null
  if (driver.status === 'off-duty' || driver.status === 'sleeper-berth') {
    return Math.max(0, HOS_RESET_MINUTES - driver.currentStatusMinutes)
  }
  if (driver.status === 'driving') {
    return Math.max(0, driveMinutesRemaining) + HOS_RESET_MINUTES
  }
  return null
}

export function buildDriverSummaries(fleet: FleetData): DriverSummary[] {
  const trucksById = new Map(fleet.trucks.map((truck) => [truck.id, truck]))
  const routesById = new Map(fleet.routes.map((route) => [route.id, route]))
  const deliveriesById = new Map(fleet.deliveries.map((delivery) => [delivery.id, delivery]))

  return fleet.drivers.map((driver) => {
    const truck = trucksById.get(driver.truckId)
    if (!truck) throw new Error(`Missing truck for ${driver.id}`)

    const route = driver.routeId ? routesById.get(driver.routeId) ?? null : null
    const currentDeliveryId = route?.deliveryIds[route.completedStops]
    const currentDelivery = currentDeliveryId
      ? deliveriesById.get(currentDeliveryId) ?? null
      : null
    const driveMinutesUsed = getDriveMinutesUsed(driver)
    const driveMinutesRemaining = driveMinutesUsed === null
      ? null
      : HOS_DRIVE_LIMIT_MINUTES - driveMinutesUsed
    const estimatedDriveMinutesRemaining = route?.estimatedDriveMinutesRemaining ?? 0
    const severity = getHosSeverity(driveMinutesRemaining, estimatedDriveMinutesRemaining)
    const freshness = getDataFreshness(driver)
    const projectedOverLimit = driveMinutesRemaining !== null
      && estimatedDriveMinutesRemaining > driveMinutesRemaining

    return {
      driver,
      truck,
      route,
      currentDelivery,
      driveMinutesUsed,
      driveMinutesRemaining,
      severity,
      freshness,
      projectedOverLimit,
      remainingStops: route ? route.deliveryIds.length - route.completedStops : 0,
      legalStopTime: getLegalStopTime(fleet.snapshotTime, driver, driveMinutesRemaining),
      resetMinutesRemaining: getResetMinutesRemaining(driver, driveMinutesRemaining),
    }
  })
}

const severityOrder: Record<HosSeverity, number> = {
  violation: 0,
  critical: 1,
  warning: 2,
  'no-data': 3,
  normal: 4,
}

export function sortByUrgency(summaries: DriverSummary[]): DriverSummary[] {
  return summaries.toSorted((first, second) => {
    const severityDifference = severityOrder[first.severity] - severityOrder[second.severity]
    if (severityDifference !== 0) return severityDifference

    if (first.freshness !== 'live' && second.freshness === 'live') return -1
    if (first.freshness === 'live' && second.freshness !== 'live') return 1

    return (first.driveMinutesRemaining ?? Number.MAX_SAFE_INTEGER)
      - (second.driveMinutesRemaining ?? Number.MAX_SAFE_INTEGER)
  })
}

export function isViolation(summary: DriverSummary): boolean {
  return summary.severity === 'violation'
}

export function canReassignLoad(summary: DriverSummary): boolean {
  return summary.route !== null
}

export function getRouteOverageMinutes(summary: DriverSummary): number | null {
  if (
    !summary.projectedOverLimit
    || !summary.route
    || summary.driveMinutesRemaining === null
  ) {
    return null
  }
  return summary.route.estimatedDriveMinutesRemaining - summary.driveMinutesRemaining
}

export function getDutyTotals(summary: DriverSummary): Record<DutyStatus, number> | null {
  if (!summary.driver.dutyLog) return null

  const totals: Record<DutyStatus, number> = {
    driving: 0,
    'on-duty': 0,
    'on-break': 0,
    'sleeper-berth': 0,
    'off-duty': 0,
  }
  totals[summary.driver.status] = summary.driver.currentStatusMinutes

  for (const segment of summary.driver.dutyLog) {
    totals[segment.status] += segment.durationMinutes
  }
  return totals
}

export function buildDutyTimeline(summary: DriverSummary): DutyTimelineEntry[] | null {
  if (!summary.driver.dutyLog) return null

  const historical = summary.driver.dutyLog.map((segment) => ({
    id: `${summary.driver.id}:${segment.status}:${segment.startTime}:${segment.durationMinutes}`,
    label: segment.startTime,
    status: segment.status,
    durationMinutes: segment.durationMinutes,
    isCurrent: false,
  }))

  return [
    ...historical,
    {
      id: `${summary.driver.id}:current:${summary.driver.status}`,
      label: 'Now',
      status: summary.driver.status,
      durationMinutes: summary.driver.currentStatusMinutes,
      isCurrent: true,
    },
  ]
}

export function formatDuration(minutes: number | null): string {
  if (minutes === null) return 'No data'

  const absoluteMinutes = Math.abs(minutes)
  const hours = Math.floor(absoluteMinutes / 60)
  const remainingMinutes = absoluteMinutes % 60
  const formatted = hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`

  return minutes < 0 ? `${formatted} over` : formatted
}

export function getNextLegalAction(summary: DriverSummary): string {
  if (summary.driveMinutesRemaining === null) {
    return 'Confirm driver status before dispatching'
  }
  if (summary.driveMinutesRemaining <= 0) {
    return summary.resetMinutesRemaining === null
      ? 'Stop driving now · begin required reset'
      : `Stop driving now · reset complete in ${formatDuration(summary.resetMinutesRemaining)}`
  }
  if (summary.driver.status === 'driving' && summary.legalStopTime) {
    const stopTime = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    }).format(new Date(summary.legalStopTime))
    return summary.resetMinutesRemaining === null
      ? `Must stop by ${stopTime} · then begin required reset`
      : `Must stop by ${stopTime} · reset complete in ${formatDuration(summary.resetMinutesRemaining)}`
  }
  if (summary.driver.status === 'on-break') {
    return `Resume with ${formatDuration(summary.driveMinutesRemaining)} drive time`
  }
  return `${formatDuration(summary.driveMinutesRemaining)} drive time available`
}
