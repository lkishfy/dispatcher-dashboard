import type { DriverSummary } from '../../domain/hos'

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
  return summaries.flatMap((summary) => getSearchableFields(summary))
    .filter((suggestion): suggestion is string => Boolean(suggestion))
}

export function matchesDriverSearch(summary: DriverSummary, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  return getSearchableFields(summary)
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(normalizedQuery)
}
