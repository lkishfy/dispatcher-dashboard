import { describe, expect, it } from 'vitest'
import { createDriverSummary } from '../test/factories'
import { buildBatchReassignments, getReassignmentCandidates } from './reassignment'
import type { DriverSummary } from './hos'

function makeSummary(
  id: string,
  severity: DriverSummary['severity'],
  available: boolean,
  distance: number,
): DriverSummary {
  const summary = createDriverSummary(id, id, 360, available)
  return {
    ...summary,
    severity,
    projectedOverLimit: false,
    driver: {
      ...summary.driver,
      distanceFromHubMiles: distance,
    },
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
    const loadBase = makeSummary('load', 'critical', false, 0)
    if (!loadBase.route) throw new Error('Expected a routed load fixture')
    const load = {
      ...loadBase,
      route: {
        ...loadBase.route,
        destination: 'Madison, WI',
        estimatedDriveMinutesRemaining: 120,
      },
    }

    const localBase = makeSummary('local', 'normal', true, 12)
    const local = {
      ...localBase,
      driver: { ...localBase.driver, location: 'Madison, WI' },
      driveMinutesRemaining: 300,
    }

    const nearerHubBase = makeSummary('nearer-hub', 'normal', true, 5)
    const nearerHub = {
      ...nearerHubBase,
      driver: { ...nearerHubBase.driver, location: 'Chicago, IL' },
      driveMinutesRemaining: 300,
    }

    const wrongEquipmentBase = makeSummary('wrong-equipment', 'normal', true, 2)
    const wrongEquipment = {
      ...wrongEquipmentBase,
      truck: { ...wrongEquipmentBase.truck, type: 'Reefer' as const },
    }

    const insufficientHos = {
      ...makeSummary('insufficient-hos', 'normal', true, 1),
      driveMinutesRemaining: 100,
    }

    const candidates = getReassignmentCandidates(
      load,
      [nearerHub, wrongEquipment, insufficientHos, local],
    )

    expect(candidates.map((candidate) => candidate.driver.id)).toEqual(['local', 'nearer-hub'])
  })
})
