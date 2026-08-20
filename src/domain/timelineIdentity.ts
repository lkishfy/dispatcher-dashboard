import type { DutySegment } from '../types/fleet'

// Duty entries are immutable and chronological; this identity remains stable when
// a new current entry is appended to the local snapshot.
export function getDutyTimelineEntryId(
  driverId: string,
  segment: DutySegment,
): string {
  return `${driverId}:${segment.status}:${segment.startTime}:${segment.durationMinutes}`
}
