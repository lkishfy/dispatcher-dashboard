export const DUTY_STATUSES = [
  'driving',
  'on-duty',
  'on-break',
  'sleeper-berth',
  'off-duty',
] as const

export const DELIVERY_STATUSES = ['completed', 'in-progress', 'scheduled'] as const
export const DELIVERY_PRIORITIES = ['standard', 'time-critical'] as const
export const TRUCK_STATUSES = ['active', 'available', 'maintenance'] as const
export const TRUCK_TYPES = ['Dry van', 'Reefer', 'Flatbed'] as const

export type DutyStatus = typeof DUTY_STATUSES[number]
type DeliveryStatus = typeof DELIVERY_STATUSES[number]
type DeliveryPriority = typeof DELIVERY_PRIORITIES[number]
type TruckStatus = typeof TRUCK_STATUSES[number]
type TruckType = typeof TRUCK_TYPES[number]

interface DutySegment {
  status: DutyStatus
  startTime: string
  durationMinutes: number
}

interface DriverTelemetry {
  online: boolean
  lastUpdatedMinutesAgo: number | null
}

export interface Driver {
  id: string
  name: string
  initials: string
  truckId: string
  routeId: string | null
  status: DutyStatus
  currentStatusMinutes: number
  location: string
  dutyLog: DutySegment[] | null
  telemetry: DriverTelemetry
  availableForReassignment: boolean
  distanceFromHubMiles: number
}

export interface Truck {
  id: string
  unitNumber: string
  type: TruckType
  status: TruckStatus
}

export interface Route {
  id: string
  driverId: string
  origin: string
  destination: string
  loadLabel: string
  deliveryIds: string[]
  completedStops: number
  projectedMinutesRemaining: number
  estimatedDriveMinutesRemaining: number
}

export interface Delivery {
  id: string
  routeId: string
  sequence: number
  customer: string
  city: string
  status: DeliveryStatus
  etaMinutes: number
  serviceMinutes: number
  cases: number
  priority: DeliveryPriority
}

export interface FleetData {
  snapshotTime: string
  drivers: Driver[]
  trucks: Truck[]
  routes: Route[]
  deliveries: Delivery[]
}
