import { describe, expect, it } from 'vitest'
import { buildBatchReassignments, getReassignmentCandidates } from './reassignment'
import type { DriverSummary } from './hos'
import type { Driver } from '../types/fleet'

const baseDriver: Driver = {
  id: 'driver-base',
  name: 'Base Driver',
  initials: 'BD',
  truckId: 'truck-base',
  routeId: 'route-base',
  status: 'driving',
  currentStatusMinutes: 10,
  location: 'Chicago, IL',
  dutyLog: [],
  telemetry: { online: true, lastUpdatedMinutesAgo: 1 },
  availableForReassignment: false,
  distanceFromHubMiles: 10,
}

function makeSummary(
  id: string,
  severity: DriverSummary['severity'],
  available: boolean,
  distance: number,
): DriverSummary {
  return {
    driver: {
      ...baseDriver,
      id,
      name: id,
      availableForReassignment: available,
      distanceFromHubMiles: distance,
    },
    truck: {
      id: `truck-${id}`,
      unitNumber: `T-${id}`,
      type: 'Dry van',
      status: available ? 'available' : 'active',
    },
    route: available ? null : {
      id: `route-${id}`,
      driverId: id,
      origin: 'Hub',
      destination: 'City',
      loadLabel: `LD-${id}`,
      deliveryIds: ['d1'],
      completedStops: 0,
      projectedMinutesRemaining: 60,
      estimatedDriveMinutesRemaining: 40,
    },
    currentDelivery: null,
    driveMinutesUsed: 300,
    driveMinutesRemaining: 360,
    severity,
    freshness: 'live',
    projectedOverLimit: false,
    remainingStops: 1,
    legalStopTime: null,
  }
}

describe('buildBatchReassignments', () => {
  it('pairs urgent loads with the nearest available drivers', () => {
    const loads = [
      makeSummary('load-a', 'warning', false, 0),
      makeSummary('load-b', 'violation', false, 0),
    ]
    const available = [
      makeSummary('rep-1', 'normal', true, 5),
      makeSummary('rep-2', 'normal', true, 12),
    ]

    const assignments = buildBatchReassignments(loads, available)

    expect(assignments['load-b']).toBe('rep-1')
    expect(assignments['load-a']).toBe('rep-2')
  })

  it('stops when there are more loads than available drivers', () => {
    const loads = [
      makeSummary('load-a', 'violation', false, 0),
      makeSummary('load-b', 'critical', false, 0),
    ]
    const available = [makeSummary('rep-1', 'normal', true, 5)]

    const assignments = buildBatchReassignments(loads, available)

    expect(Object.keys(assignments)).toHaveLength(1)
    expect(assignments['load-a']).toBe('rep-1')
  })
})

describe('getReassignmentCandidates', () => {
  it('derives load-specific options from equipment, route location, and HOS capacity', () => {
    const load = makeSummary('load', 'critical', false, 0)
    load.route!.destination = 'Madison, WI'
    load.route!.estimatedDriveMinutesRemaining = 120

    const local = makeSummary('local', 'normal', true, 12)
    local.driver.location = 'Madison, WI'
    local.driveMinutesRemaining = 300

    const nearerHub = makeSummary('nearer-hub', 'normal', true, 5)
    nearerHub.driver.location = 'Chicago, IL'
    nearerHub.driveMinutesRemaining = 300

    const wrongEquipment = makeSummary('wrong-equipment', 'normal', true, 2)
    wrongEquipment.truck.type = 'Reefer'

    const insufficientHos = makeSummary('insufficient-hos', 'normal', true, 1)
    insufficientHos.driveMinutesRemaining = 100

    const candidates = getReassignmentCandidates(
      load,
      [nearerHub, wrongEquipment, insufficientHos, local],
    )

    expect(candidates.map((candidate) => candidate.driver.id)).toEqual(['local', 'nearer-hub'])
  })
})
