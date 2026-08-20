import {
  DATA_FRESHNESS_STATES,
  HOS_SEVERITIES,
  type DataFreshness,
  type HosSeverity,
} from '../../domain/hos'
import { DUTY_STATUSES, type DutyStatus } from '../../types/fleet'
import { freshnessLabels, severityLabels, statusLabels } from './display'
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

const statusOptions: Array<{ value: DutyStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All statuses' },
  ...DUTY_STATUSES.map((value) => ({ value, label: statusLabels[value] })),
]

const severityOptions: Array<{ value: HosSeverity | 'all'; label: string }> = [
  { value: 'all', label: 'All HOS states' },
  ...HOS_SEVERITIES.map((value) => ({ value, label: severityLabels[value] })),
]

const freshnessOptions: Array<{ value: DataFreshness | 'all'; label: string }> = [
  { value: 'all', label: 'All connections' },
  ...DATA_FRESHNESS_STATES.map((value) => ({ value, label: freshnessLabels[value] })),
]

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
          options={statusOptions}
          onChange={onStatusChange}
          ariaLabel="Filter by duty status"
          className="w-full sm:w-auto"
        />
        <HexSelect
          value={severity}
          options={severityOptions}
          onChange={onSeverityChange}
          ariaLabel="Filter by HOS severity"
          className="w-full sm:w-auto"
        />
        <HexSelect
          value={freshness}
          options={freshnessOptions}
          onChange={onFreshnessChange}
          ariaLabel="Filter by data freshness"
          className="w-full sm:w-auto"
        />
      </div>
    </div>
  )
}
