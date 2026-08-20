import { describe, expect, it } from 'vitest'
import { createDriverSummary } from '../test/factories'
import {
  getDataFreshness,
  getDriveMinutesUsed,
  getHosSeverity,
  sortByUrgency,
  type DriverSummary,
} from './hos'
import type { Driver } from '../types/fleet'

const driver: Driver = {
  id: 'driver-test',
  name: 'Test Driver',
  initials: 'TD',
  truckId: 'truck-test',
  routeId: 'route-test',
  status: 'driving',
  currentStatusMinutes: 20,
  location: 'Chicago, IL',
  dutyLog: [
    { status: 'driving', startTime: '05:00', durationMinutes: 300 },
    { status: 'on-break', startTime: '10:00', durationMinutes: 30 },
    { status: 'driving', startTime: '10:30', durationMinutes: 280 },
  ],
  telemetry: { online: true, lastUpdatedMinutesAgo: 2 },
  availableForReassignment: false,
  distanceFromHubMiles: 12,
}

describe('HOS calculations', () => {
  it('adds the current driving segment to completed driving time', () => {
    expect(getDriveMinutesUsed(driver)).toBe(600)
  })

  it('distinguishes warning, critical, and violation states', () => {
    expect(getHosSeverity(75, 40)).toBe('warning')
    expect(getHosSeverity(25, 20)).toBe('critical')
    expect(getHosSeverity(-12, 0)).toBe('violation')
  })

  it('warns when a route needs more drive time than the driver has left', () => {
    expect(getHosSeverity(140, 175)).toBe('warning')
  })

  it('distinguishes live, offline, and missing telemetry', () => {
    expect(getDataFreshness(driver)).toBe('live')
    expect(getDataFreshness({
      ...driver,
      telemetry: { online: true, lastUpdatedMinutesAgo: 8 },
    })).toBe('live')
    expect(getDataFreshness({
      ...driver,
      telemetry: { online: false, lastUpdatedMinutesAgo: 22 },
    })).toBe('offline')
    expect(getDataFreshness({
      ...driver,
      telemetry: { online: true, lastUpdatedMinutesAgo: null },
    })).toBe('no-data')
  })
})

describe('alert ordering', () => {
  it('sorts violations before approaching limits', () => {
    const makeSummary = (
      severity: DriverSummary['severity'],
      driveMinutesRemaining: number,
    ): DriverSummary => ({
      ...createDriverSummary('driver-test', 'Test Driver', driveMinutesRemaining),
      driver,
      route: null,
      severity,
      projectedOverLimit: false,
      remainingStops: 0,
    })

    const sorted = sortByUrgency([
      makeSummary('warning', 60),
      makeSummary('violation', -10),
      makeSummary('critical', 20),
    ])

    expect(sorted.map((summary) => summary.severity)).toEqual([
      'violation',
      'critical',
      'warning',
    ])
  })
})
