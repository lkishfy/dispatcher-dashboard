import {
  DELIVERY_PRIORITIES,
  DELIVERY_STATUSES,
  DUTY_STATUSES,
  TRUCK_STATUSES,
  TRUCK_TYPES,
  type FleetData,
} from '../types/fleet'

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function assertRecord(value: unknown, path: string): asserts value is JsonRecord {
  if (!isRecord(value)) throw new Error(`${path} must be an object`)
}

function assertString(value: unknown, path: string): asserts value is string {
  if (typeof value !== 'string') throw new Error(`${path} must be a string`)
}

function assertNumber(value: unknown, path: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${path} must be a finite number`)
  }
}

function assertBoolean(value: unknown, path: string): asserts value is boolean {
  if (typeof value !== 'boolean') throw new Error(`${path} must be a boolean`)
}

function assertNullableString(value: unknown, path: string): void {
  if (value !== null) assertString(value, path)
}

function assertNullableNumber(value: unknown, path: string): void {
  if (value !== null) assertNumber(value, path)
}

function assertEnum<T extends string>(
  value: unknown,
  options: readonly T[],
  path: string,
): asserts value is T {
  if (typeof value !== 'string' || !options.some((option) => option === value)) {
    throw new Error(`${path} must be one of: ${options.join(', ')}`)
  }
}

function assertStringArray(value: unknown, path: string): asserts value is string[] {
  if (!Array.isArray(value)) throw new Error(`${path} must be an array`)
  value.forEach((entry, index) => assertString(entry, `${path}[${index}]`))
}

function assertDriver(value: unknown, path: string): void {
  assertRecord(value, path)
  for (const key of ['id', 'name', 'initials', 'truckId', 'location'] as const) {
    assertString(value[key], `${path}.${key}`)
  }
  assertNullableString(value.routeId, `${path}.routeId`)
  assertEnum(value.status, DUTY_STATUSES, `${path}.status`)
  assertNumber(value.currentStatusMinutes, `${path}.currentStatusMinutes`)
  assertBoolean(value.availableForReassignment, `${path}.availableForReassignment`)
  assertNumber(value.distanceFromHubMiles, `${path}.distanceFromHubMiles`)

  assertRecord(value.telemetry, `${path}.telemetry`)
  assertBoolean(value.telemetry.online, `${path}.telemetry.online`)
  assertNullableNumber(
    value.telemetry.lastUpdatedMinutesAgo,
    `${path}.telemetry.lastUpdatedMinutesAgo`,
  )

  if (value.dutyLog !== null) {
    if (!Array.isArray(value.dutyLog)) throw new Error(`${path}.dutyLog must be an array or null`)
    value.dutyLog.forEach((segment, index) => {
      const segmentPath = `${path}.dutyLog[${index}]`
      assertRecord(segment, segmentPath)
      assertEnum(segment.status, DUTY_STATUSES, `${segmentPath}.status`)
      assertString(segment.startTime, `${segmentPath}.startTime`)
      assertNumber(segment.durationMinutes, `${segmentPath}.durationMinutes`)
    })
  }
}

function assertTruck(value: unknown, path: string): void {
  assertRecord(value, path)
  assertString(value.id, `${path}.id`)
  assertString(value.unitNumber, `${path}.unitNumber`)
  assertEnum(value.type, TRUCK_TYPES, `${path}.type`)
  assertEnum(value.status, TRUCK_STATUSES, `${path}.status`)
}

function assertRoute(value: unknown, path: string): void {
  assertRecord(value, path)
  for (const key of ['id', 'driverId', 'origin', 'destination', 'loadLabel'] as const) {
    assertString(value[key], `${path}.${key}`)
  }
  assertStringArray(value.deliveryIds, `${path}.deliveryIds`)
  for (const key of [
    'completedStops',
    'projectedMinutesRemaining',
    'estimatedDriveMinutesRemaining',
  ] as const) {
    assertNumber(value[key], `${path}.${key}`)
  }
}

function assertDelivery(value: unknown, path: string): void {
  assertRecord(value, path)
  for (const key of ['id', 'routeId', 'customer', 'city'] as const) {
    assertString(value[key], `${path}.${key}`)
  }
  for (const key of [
    'sequence',
    'etaMinutes',
    'serviceMinutes',
    'cases',
  ] as const) {
    assertNumber(value[key], `${path}.${key}`)
  }
  assertEnum(value.status, DELIVERY_STATUSES, `${path}.status`)
  assertEnum(value.priority, DELIVERY_PRIORITIES, `${path}.priority`)
}

function assertFleetData(value: unknown): asserts value is FleetData {
  assertRecord(value, 'fleet')
  assertString(value.snapshotTime, 'fleet.snapshotTime')

  const collections = [
    ['drivers', assertDriver],
    ['trucks', assertTruck],
    ['routes', assertRoute],
    ['deliveries', assertDelivery],
  ] as const

  for (const [key, assertEntry] of collections) {
    const collection = value[key]
    if (!Array.isArray(collection)) throw new Error(`fleet.${key} must be an array`)
    collection.forEach((entry, index) => assertEntry(entry, `fleet.${key}[${index}]`))
  }
}

export function parseFleetData(value: unknown): FleetData {
  assertFleetData(value)
  return value
}
