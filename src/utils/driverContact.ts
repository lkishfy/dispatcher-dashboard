export function getDriverPhone(driverId: string): string {
  const num = Number.parseInt(driverId.replace('driver-', ''), 10)
  const line = Number.isFinite(num) ? 1000 + num : 1001
  return `(312) 555-${String(line).slice(-4)}`
}

export const violationStopPingMessage =
  'URGENT: Stop driving now. You are over the 11-hour limit. Pull over safely and begin your 10-hour reset.'

export type ContactActionType = 'call' | 'ping'

export interface ContactActionStatus {
  type: ContactActionType
  at: Date
  phase: 'pending' | 'connected' | 'delivered' | 'failed'
}
