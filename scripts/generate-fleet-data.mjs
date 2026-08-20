import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const names = [
  'Alex Rivera', 'Maya Chen', 'Jordan Brooks', 'Priya Shah', 'Marcus Green',
  'Elena Garcia', 'Theo Bennett', 'Devon King', 'Linda Park', 'Omar Hassan',
  'Grace Kim', 'Noah Williams', 'Sofia Martinez', 'Ethan Carter', 'Ava Thompson',
  'Liam Wilson', 'Mia Anderson', 'Lucas Moore', 'Chloe Davis', 'Henry Jackson',
  'Nora White', 'Caleb Harris', 'Zoe Clark', 'Isaac Lewis', 'Leah Walker',
  'Miles Hall', 'Ruby Allen', 'Cole Young', 'Iris Hernandez', 'Jude Wright',
  'Emma Lopez', 'Finn Hill', 'Lily Scott', 'Jack Adams', 'Aria Baker',
  'Leo Nelson', 'Maya Mitchell', 'Ezra Perez', 'Lucy Roberts', 'Owen Turner',
  'Ella Phillips', 'Kai Campbell', 'June Parker', 'Max Evans', 'Rose Edwards',
  'Sam Collins', 'Ada Stewart', 'Ben Sanchez', 'Ivy Morris', 'Eli Rogers',
]

const cities = [
  'Chicago, IL', 'Gary, IN', 'Milwaukee, WI', 'Joliet, IL', 'Rockford, IL',
  'Madison, WI', 'South Bend, IN', 'Kenosha, WI', 'Naperville, IL', 'Elgin, IL',
]

const customers = [
  'Northstar Foods', 'Central Market', 'Beacon Supply', 'Metro Grocers',
  'Summit Dining', 'Lakeside Hotel', 'Oak & Main', 'Harbor Kitchens',
]

const statuses = ['driving', 'on-duty', 'on-break', 'sleeper-berth', 'off-duty']
const snapshotTime = '2026-08-20T14:00:00.000Z'

function makeDutyLog(driverIndex, driveMinutes, hasData) {
  if (!hasData) return null

  const currentStatus = getDriverStatus(driverIndex)
  const currentDrivingMinutes = currentStatus === 'driving' ? 18 + (driverIndex % 17) : 0
  const completedDriveMinutes = Math.max(0, driveMinutes - currentDrivingMinutes)
  const firstDrivingBlock = Math.min(270, completedDriveMinutes)
  const secondDrivingBlock = completedDriveMinutes - firstDrivingBlock

  const log = [
    { status: 'on-duty', startTime: '04:30', durationMinutes: 30 },
    { status: 'driving', startTime: '05:00', durationMinutes: firstDrivingBlock },
    { status: 'on-break', startTime: '09:30', durationMinutes: 30 },
  ]

  if (secondDrivingBlock > 0) {
    log.push({ status: 'driving', startTime: '10:00', durationMinutes: secondDrivingBlock })
  }

  return log
}

function getDriverStatus(index) {
  const specialStatuses = {
    0: 'driving',
    1: 'driving',
    2: 'driving',
    3: 'on-break',
    4: 'driving',
    5: 'on-duty',
    6: 'driving',
    7: 'off-duty',
    8: 'driving',
  }

  return specialStatuses[index] ?? statuses[index % statuses.length]
}

function getDriveMinutes(index) {
  const specialDriveMinutes = [
    672, 674, 687, 585, 420, 0, 668, 300, 510, 501,
    620, 600, 605, 590, 580, 630,
  ]
  return specialDriveMinutes[index] ?? 240 + ((index * 29) % 275)
}

function getProjectedDriveMinutes(index) {
  const specialMinutes = [45, 58, 92, 68, 105, 80, 52, 0, 178]
  return specialMinutes[index] ?? 35 + ((index * 17) % 100)
}

const trucks = names.map((_, index) => ({
  id: `truck-${String(index + 1).padStart(2, '0')}`,
  unitNumber: `T-${String(240 + index).padStart(3, '0')}`,
  type: ['Dry van', 'Reefer', 'Flatbed'][index % 3],
  status: index === 46 ? 'maintenance' : index >= 45 ? 'available' : 'active',
}))

const drivers = names.map((name, index) => {
  const status = getDriverStatus(index)
  const driveMinutes = getDriveMinutes(index)
  const hasData = index !== 5
  const online = index !== 4 && index !== 47
  const activeRoute = index < 45

  return {
    id: `driver-${String(index + 1).padStart(2, '0')}`,
    name,
    initials: name.split(' ').map((part) => part[0]).join(''),
    truckId: trucks[index].id,
    routeId: activeRoute ? `route-${String(index + 1).padStart(2, '0')}` : null,
    status,
    currentStatusMinutes: status === 'driving' ? 18 + (index % 17) : 12 + (index % 25),
    location: cities[index % cities.length],
    dutyLog: makeDutyLog(index, driveMinutes, hasData),
    telemetry: {
      online,
      lastUpdatedMinutesAgo: hasData ? (online ? 1 + (index % 4) : 28) : null,
    },
    availableForReassignment: index >= 45 || index === 7,
    distanceFromHubMiles: 2 + ((index * 7) % 42),
  }
})

const deliveries = []
const routes = []

for (let routeIndex = 0; routeIndex < 45; routeIndex += 1) {
  const stopCount = routeIndex < 10 ? 23 : 22
  const routeId = `route-${String(routeIndex + 1).padStart(2, '0')}`
  const completedStops = Math.min(stopCount - 1, 4 + (routeIndex % 14))
  const deliveryIds = []

  for (let stopIndex = 0; stopIndex < stopCount; stopIndex += 1) {
    const deliveryNumber = deliveries.length + 1
    const deliveryId = `delivery-${String(deliveryNumber).padStart(4, '0')}`
    deliveryIds.push(deliveryId)

    deliveries.push({
      id: deliveryId,
      routeId,
      sequence: stopIndex + 1,
      customer: customers[(routeIndex + stopIndex) % customers.length],
      city: cities[(routeIndex + stopIndex + 1) % cities.length],
      status: stopIndex < completedStops
        ? 'completed'
        : stopIndex === completedStops
          ? 'in-progress'
          : 'scheduled',
      etaMinutes: Math.max(0, (stopIndex - completedStops) * 24),
      serviceMinutes: 12 + ((routeIndex + stopIndex) % 14),
      cases: 8 + ((routeIndex * 11 + stopIndex * 7) % 72),
      priority: (routeIndex + stopIndex) % 11 === 0 ? 'time-critical' : 'standard',
    })
  }

  const estimatedDriveMinutesRemaining = getProjectedDriveMinutes(routeIndex)
  routes.push({
    id: routeId,
    driverId: drivers[routeIndex].id,
    origin: 'Chicago Distribution Center',
    destination: cities[(routeIndex + 4) % cities.length],
    loadLabel: `LD-${String(8400 + routeIndex).padStart(4, '0')}`,
    deliveryIds,
    completedStops,
    projectedMinutesRemaining: estimatedDriveMinutesRemaining + 35 + (routeIndex % 40),
    estimatedDriveMinutesRemaining,
  })
}

const fleetData = { snapshotTime, drivers, trucks, routes, deliveries }
const currentDirectory = dirname(fileURLToPath(import.meta.url))
const outputPath = resolve(currentDirectory, '../src/data/fleet.json')

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(fleetData, null, 2)}\n`)

console.log(`Created ${drivers.length} drivers, ${trucks.length} trucks, and ${deliveries.length} deliveries.`)
