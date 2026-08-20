export function getDriverPhone(driverId: string): string {
  const num = Number.parseInt(driverId.replace('driver-', ''), 10)
  const line = Number.isFinite(num) ? 1000 + num : 1001
  return `(312) 555-${String(line).slice(-4)}`
}

export function getDriverTelHref(driverId: string): string {
  return `tel:${getDriverPhone(driverId).replace(/\D/g, '')}`
}

export const violationStopPingMessage =
  'URGENT: Stop driving now. You are over the 11-hour limit. Pull over safely and begin your 10-hour reset.'

export type ContactActionStatus =
  | { type: 'call'; at: Date; phase: 'pending' | 'connected' }
  | { type: 'ping'; at: Date; phase: 'pending' | 'delivered' }
