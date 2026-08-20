import type { FleetData } from '../types/fleet'

const SIMULATED_MINUTES_PER_REFRESH = 1

export function simulateFleetRefresh(
  fleet: FleetData,
  snapshotTime: string,
): FleetData {
  const activeRouteIds = new Set(
    fleet.drivers
      .filter((driver) => driver.telemetry.online && driver.status === 'driving')
      .map((driver) => driver.routeId)
      .filter((routeId): routeId is string => routeId !== null),
  )

  return {
    ...fleet,
    snapshotTime,
    drivers: fleet.drivers.map((driver) => ({
      ...driver,
      currentStatusMinutes: driver.telemetry.online && driver.status === 'driving'
        ? driver.currentStatusMinutes + SIMULATED_MINUTES_PER_REFRESH
        : driver.currentStatusMinutes,
      telemetry: {
        ...driver.telemetry,
        lastUpdatedMinutesAgo: driver.telemetry.lastUpdatedMinutesAgo === null
          ? null
          : driver.telemetry.online
            ? 0
            : driver.telemetry.lastUpdatedMinutesAgo + SIMULATED_MINUTES_PER_REFRESH,
      },
    })),
    routes: fleet.routes.map((route) => activeRouteIds.has(route.id)
      ? {
          ...route,
          projectedMinutesRemaining: Math.max(
            0,
            route.projectedMinutesRemaining - SIMULATED_MINUTES_PER_REFRESH,
          ),
          estimatedDriveMinutesRemaining: Math.max(
            0,
            route.estimatedDriveMinutesRemaining - SIMULATED_MINUTES_PER_REFRESH,
          ),
        }
      : route),
  }
}
