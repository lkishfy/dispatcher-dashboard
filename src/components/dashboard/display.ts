import type { DataFreshness, HosSeverity } from '../../domain/hos'
import type { DutyStatus } from '../../types/fleet'

export const severityLabels: Record<HosSeverity, string> = {
  violation: 'HOS violation',
  critical: 'Limit imminent',
  warning: 'Approaching limit',
  normal: 'On track',
  'no-data': 'HOS unknown',
}

export const severityStyles: Record<HosSeverity, string> = {
  violation: 'border-risk-critical-border bg-risk-critical-surface text-risk-critical',
  critical: 'border-risk-high-border bg-risk-high-surface text-risk-high',
  warning: 'border-risk-medium-border bg-risk-medium-surface text-warning-text',
  normal: 'border-success-border bg-success-surface text-success-text',
  'no-data': 'border-hex-border bg-hex-bg text-hex-muted',
}

export const severityDotStyles: Record<HosSeverity, string> = {
  violation: 'bg-risk-critical',
  critical: 'bg-risk-high',
  warning: 'bg-risk-medium',
  normal: 'bg-success',
  'no-data': 'bg-hex-muted',
}

export const statusLabels: Record<DutyStatus, string> = {
  driving: 'Driving',
  'on-duty': 'On duty',
  'on-break': 'On break',
  'sleeper-berth': 'Sleeper berth',
  'off-duty': 'Off duty',
}

export const freshnessLabels: Record<DataFreshness, string> = {
  live: 'Live',
  stale: 'Stale data',
  offline: 'Offline',
  'no-data': 'No data',
}

export const freshnessDotStyles: Record<DataFreshness, string> = {
  live: 'bg-success',
  stale: 'bg-warning',
  offline: 'bg-risk-critical',
  'no-data': 'bg-hex-muted',
}
