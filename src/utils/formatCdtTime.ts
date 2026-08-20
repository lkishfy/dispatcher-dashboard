const CDT_TIME_ZONE = 'America/Chicago'

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  timeZone: CDT_TIME_ZONE,
  timeZoneName: 'short',
})

const refreshFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: CDT_TIME_ZONE,
  timeZoneName: 'short',
})

export function formatCdtClock(date: Date): string {
  return timeFormatter.format(date)
}

export function formatCdtRefreshTime(date: Date): string {
  return refreshFormatter.format(date)
}
