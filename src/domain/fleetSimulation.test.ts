import { describe, expect, it } from 'vitest'
import type { FleetData } from '../types/fleet'
import { buildDriverSummaries } from './hos'
import { simulateFleetRefresh } from './fleetSimulation'

const fleet: FleetData = {
  snapshotTime: '2026-08-20T14:00:00.000Z',
  drivers: [
    {
      id: 'online-driver',
      name: 'Online Driver',
      initials: 'OD',
      truckId: 'truck-1',
      routeId: 'route-1',
      status: 'driving',
      currentStatusMinutes: 30,
      location: 'Chicago, IL',
      dutyLog: [],
      telemetry: { online: true, lastUpdatedMinutesAgo: 8 },
      availableForReassignment: false,
      distanceFromHubMiles: 5,
    },
    {
      id: 'offline-driver',
      name: 'Offline Driver',
      initials: 'OF',
      truckId: 'truck-2',
      routeId: null,
      status: 'off-duty',
      currentStatusMinutes: 15,
      location: 'Gary, IN',
      dutyLog: [],
      telemetry: { online: false, lastUpdatedMinutesAgo: 12 },
      availableForReassignment: true,
      distanceFromHubMiles: 8,
    },
  ],
  trucks: [
    { id: 'truck-1', unitNumber: 'T-1', type: 'Dry van', status: 'active' },
    { id: 'truck-2', unitNumber: 'T-2', type: 'Dry van', status: 'available' },
  ],
  routes: [{
    id: 'route-1',
    driverId: 'online-driver',
    origin: 'Chicago',
    destination: 'Milwaukee',
    loadLabel: 'LD-1',
    deliveryIds: [],
    completedStops: 0,
    projectedMinutesRemaining: 60,
    estimatedDriveMinutesRemaining: 45,
  }],
  deliveries: [],
}

describe('simulateFleetRefresh', () => {
  it('refreshes online telemetry and advances its HOS projection', () => {
    const refreshed = simulateFleetRefresh(fleet, '2026-08-20T14:01:00.000Z')
    const onlineDriver = refreshed.drivers[0]

    expect(refreshed.snapshotTime).toBe('2026-08-20T14:01:00.000Z')
    expect(onlineDriver.telemetry.lastUpdatedMinutesAgo).toBe(0)
    expect(onlineDriver.currentStatusMinutes).toBe(31)
    expect(refreshed.routes[0].estimatedDriveMinutesRemaining).toBe(44)

    const summary = buildDriverSummaries(refreshed)[0]
    expect(summary.freshness).toBe('live')
    expect(summary.driveMinutesRemaining).toBe(629)
  })

  it('keeps offline drivers offline and ages their last update', () => {
    const refreshed = simulateFleetRefresh(fleet, '2026-08-20T14:01:00.000Z')
    const offlineDriver = refreshed.drivers[1]

    expect(offlineDriver.telemetry.online).toBe(false)
    expect(offlineDriver.telemetry.lastUpdatedMinutesAgo).toBe(13)
    expect(offlineDriver.currentStatusMinutes).toBe(15)
  })
})
