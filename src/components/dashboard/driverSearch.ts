import {
  sortByUrgency,
  type DataFreshness,
  type DriverSummary,
  type HosSeverity,
} from '../../domain/hos'
import type { DutyStatus } from '../../types/fleet'

function getSearchableFields(summary: DriverSummary): Array<string | undefined> {
  return [
    summary.driver.name,
    summary.driver.location,
    summary.truck.unitNumber,
    summary.route?.id,
    summary.route?.loadLabel,
    summary.currentDelivery?.customer,
  ]
}

export function getDriverSearchSuggestions(summaries: DriverSummary[]): string[] {
  return [...new Set(
    summaries.flatMap((summary) => getSearchableFields(summary))
      .filter((suggestion): suggestion is string => Boolean(suggestion)),
  )]
}

interface DriverFilters {
  search: string
  status: DutyStatus | 'all'
  severity: HosSeverity | 'all'
  freshness: DataFreshness | 'all'
}

export function filterDriverSummaries(
  summaries: DriverSummary[],
  filters: DriverFilters,
): DriverSummary[] {
  return sortByUrgency(summaries.filter((summary) => {
    if (filters.status !== 'all' && summary.driver.status !== filters.status) return false
    if (filters.severity !== 'all' && summary.severity !== filters.severity) return false
    if (filters.freshness !== 'all' && summary.freshness !== filters.freshness) return false
    return matchesDriverSearch(summary, filters.search)
  }))
}

function matchesDriverSearch(summary: DriverSummary, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  return getSearchableFields(summary)
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(normalizedQuery)
}
