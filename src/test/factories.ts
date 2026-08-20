import type { DriverSummary } from '../domain/hos'
import type { Driver } from '../types/fleet'

const baseDriver: Driver = {
  id: 'driver-a',
  name: 'Alex Rivera',
  initials: 'AR',
  truckId: 'truck-a',
  routeId: 'route-a',
  status: 'driving',
  currentStatusMinutes: 20,
  location: 'Chicago, IL',
  dutyLog: [],
  telemetry: { online: true, lastUpdatedMinutesAgo: 1 },
  availableForReassignment: false,
  distanceFromHubMiles: 4,
}

export function createDriverSummary(
  id: string,
  name: string,
  remaining: number,
  available = false,
): DriverSummary {
  return {
    driver: {
      ...baseDriver,
      id,
      name,
      initials: name.slice(0, 2),
      availableForReassignment: available,
    },
    truck: {
      id: `truck-${id}`,
      unitNumber: `T-${id}`,
      type: 'Dry van',
      status: available ? 'available' : 'active',
    },
    route: available
      ? null
      : {
          id: `route-${id}`,
          driverId: id,
          origin: 'Hub',
          destination: 'City',
          loadLabel: `LOAD-${id}`,
          deliveryIds: ['stop'],
          completedStops: 0,
          projectedMinutesRemaining: 90,
          estimatedDriveMinutesRemaining: 100,
        },
    currentDelivery: null,
    driveMinutesUsed: 660 - remaining,
    driveMinutesRemaining: remaining,
    severity: remaining < 30 ? 'critical' : available ? 'normal' : 'warning',
    freshness: 'live',
    projectedOverLimit: !available,
    remainingStops: 1,
    legalStopTime: null,
  }
}
