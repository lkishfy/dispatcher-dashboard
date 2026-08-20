export type DutyStatus = 'driving' | 'on-duty' | 'on-break' | 'sleeper-berth' | 'off-duty'

type DeliveryStatus = 'completed' | 'in-progress' | 'scheduled'

type TruckStatus = 'active' | 'available' | 'maintenance'

export interface DutySegment {
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
  type: 'Dry van' | 'Reefer' | 'Flatbed'
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
  priority: 'standard' | 'time-critical'
}

export interface FleetData {
  snapshotTime: string
  drivers: Driver[]
  trucks: Truck[]
  routes: Route[]
  deliveries: Delivery[]
}
