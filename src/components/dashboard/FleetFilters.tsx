import type { DataFreshness, HosSeverity } from '../../domain/hos'
import type { DutyStatus } from '../../types/fleet'
import { HexSearchInput } from './HexSearchInput'
import { HexSelect } from './HexSelect'

interface FleetFiltersProps {
  search: string
  status: DutyStatus | 'all'
  severity: HosSeverity | 'all'
  freshness: DataFreshness | 'all'
  searchSuggestions: string[]
  onSearchChange: (search: string) => void
  onStatusChange: (status: DutyStatus | 'all') => void
  onSeverityChange: (severity: HosSeverity | 'all') => void
  onFreshnessChange: (freshness: DataFreshness | 'all') => void
}

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'driving', label: 'Driving' },
  { value: 'on-duty', label: 'On duty' },
  { value: 'on-break', label: 'On break' },
  { value: 'sleeper-berth', label: 'Sleeper berth' },
  { value: 'off-duty', label: 'Off duty' },
] as const satisfies ReadonlyArray<{ value: DutyStatus | 'all'; label: string }>

const severityOptions = [
  { value: 'all', label: 'All HOS states' },
  { value: 'violation', label: 'Violation' },
  { value: 'critical', label: 'Limit imminent' },
  { value: 'warning', label: 'Approaching limit' },
  { value: 'normal', label: 'On track' },
  { value: 'no-data', label: 'No data' },
] as const satisfies ReadonlyArray<{ value: HosSeverity | 'all'; label: string }>

const freshnessOptions = [
  { value: 'all', label: 'All connections' },
  { value: 'live', label: 'Live' },
  { value: 'stale', label: 'Stale data' },
  { value: 'offline', label: 'Offline' },
  { value: 'no-data', label: 'No data' },
] as const satisfies ReadonlyArray<{ value: DataFreshness | 'all'; label: string }>

export function FleetFilters({
  search,
  status,
  severity,
  freshness,
  searchSuggestions,
  onSearchChange,
  onStatusChange,
  onSeverityChange,
  onFreshnessChange,
}: FleetFiltersProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-hex-border px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
      <HexSearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search driver, route, truck…"
        ariaLabel="Search drivers, routes, or trucks"
        suggestions={searchSuggestions}
        className="w-full flex-1 lg:max-w-sm"
      />

      <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
        <HexSelect
          value={status}
          options={[...statusOptions]}
          onChange={onStatusChange}
          ariaLabel="Filter by duty status"
          className="w-full sm:w-auto"
        />
        <HexSelect
          value={severity}
          options={[...severityOptions]}
          onChange={onSeverityChange}
          ariaLabel="Filter by HOS severity"
          className="w-full sm:w-auto"
        />
        <HexSelect
          value={freshness}
          options={[...freshnessOptions]}
          onChange={onFreshnessChange}
          ariaLabel="Filter by data freshness"
          className="w-full sm:w-auto"
        />
      </div>
    </div>
  )
}
