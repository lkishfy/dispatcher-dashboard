import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { sortByUrgency, type DataFreshness, type DriverSummary, type HosSeverity } from '../../domain/hos'
import type { DutyStatus } from '../../types/fleet'
import { formatCdtRefreshTime } from '../../utils/formatCdtTime'
import { DriverTable } from './DriverTable'
import { getDriverSearchSuggestions, matchesDriverSearch } from './driverSearch'
import { FleetFilters } from './FleetFilters'

interface DriverBoardProps {
  summaries: DriverSummary[]
  selectedIds: Set<string>
  lockedDriverIds: Set<string>
  lastRefreshedAt: Date
  isRefreshing: boolean
  onToggleSelect: (driverId: string) => void
  onBatchReassign: () => void
  onOpenDriver: (driverId: string) => void
  onRefresh: () => void
}

const PAGE_SIZE = 10

function DriverBoardPagination({
  page,
  totalPages,
  totalResults,
  onPageChange,
}: {
  page: number
  totalPages: number
  totalResults: number
  onPageChange: (page: number) => void
}) {
  const firstResult = (page - 1) * PAGE_SIZE + 1
  const lastResult = Math.min(page * PAGE_SIZE, totalResults)

  return (
    <nav aria-label="Driver board pagination" className="flex flex-col gap-3 border-t border-hex-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-xs text-hex-muted">
        Showing {firstResult}–{lastResult} of {totalResults} drivers
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="hex-btn-secondary inline-flex h-9 items-center gap-1 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft aria-hidden="true" size={14} />
          Previous
        </button>
        <span className="min-w-20 text-center text-xs tabular-nums text-hex-muted">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="hex-btn-secondary inline-flex h-9 items-center gap-1 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight aria-hidden="true" size={14} />
        </button>
      </div>
    </nav>
  )
}

export function DriverBoard({
  summaries,
  selectedIds,
  lockedDriverIds,
  lastRefreshedAt,
  isRefreshing,
  onToggleSelect,
  onBatchReassign,
  onOpenDriver,
  onRefresh,
}: DriverBoardProps) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<DutyStatus | 'all'>('all')
  const [severity, setSeverity] = useState<HosSeverity | 'all'>('all')
  const [freshness, setFreshness] = useState<DataFreshness | 'all'>('all')
  const [pageAnchorId, setPageAnchorId] = useState<string | null>(null)

  const searchSuggestions = useMemo(
    () => getDriverSearchSuggestions(summaries),
    [summaries],
  )

  const filteredSummaries = useMemo(() => {
    return sortByUrgency(summaries.filter((summary) => {
      if (status !== 'all' && summary.driver.status !== status) return false
      if (severity !== 'all' && summary.severity !== severity) return false
      if (freshness !== 'all' && summary.freshness !== freshness) return false
      return matchesDriverSearch(summary, search)
    }))
  }, [freshness, search, severity, status, summaries])
  const totalPages = Math.max(1, Math.ceil(filteredSummaries.length / PAGE_SIZE))
  const anchorIndex = pageAnchorId
    ? filteredSummaries.findIndex((summary) => summary.driver.id === pageAnchorId)
    : 0
  const firstVisibleIndex = anchorIndex >= 0
    ? Math.floor(anchorIndex / PAGE_SIZE) * PAGE_SIZE
    : 0
  const currentPage = Math.floor(firstVisibleIndex / PAGE_SIZE) + 1
  const visibleSummaries = filteredSummaries.slice(
    firstVisibleIndex,
    firstVisibleIndex + PAGE_SIZE,
  )

  return (
    <section aria-labelledby="fleet-heading" className="hex-card overflow-visible">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hex-border px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="fleet-heading" className="hex-section-title text-lg">Driver Board</h2>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label={`Refresh fleet data. Last refresh ${formatCdtRefreshTime(lastRefreshedAt)}.`}
              title="Refresh fleet data"
              className="grid size-7 shrink-0 place-items-center rounded-md border border-hex-border bg-white text-hex-muted hover:bg-hex-bg hover:text-hex-ink disabled:cursor-wait disabled:opacity-70"
            >
              <RefreshCw
                aria-hidden="true"
                size={13}
                strokeWidth={1.75}
                className={isRefreshing ? 'animate-spin' : ''}
              />
            </button>
          </div>
          <p className="mt-1 text-[11px] tabular-nums text-hex-muted">
            Last refreshed {formatCdtRefreshTime(lastRefreshedAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onBatchReassign}
          disabled={selectedIds.size === 0}
          className="hex-btn-secondary min-h-10 shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reassign route
        </button>
      </div>
      <FleetFilters
        search={search}
        status={status}
        severity={severity}
        freshness={freshness}
        searchSuggestions={searchSuggestions}
        onSearchChange={(value) => { setSearch(value); setPageAnchorId(null) }}
        onStatusChange={(value) => { setStatus(value); setPageAnchorId(null) }}
        onSeverityChange={(value) => { setSeverity(value); setPageAnchorId(null) }}
        onFreshnessChange={(value) => { setFreshness(value); setPageAnchorId(null) }}
      />
      <DriverTable
        summaries={visibleSummaries}
        selectedIds={selectedIds}
        lockedDriverIds={lockedDriverIds}
        onToggleSelect={onToggleSelect}
        onOpenDriver={onOpenDriver}
      />
      {filteredSummaries.length > PAGE_SIZE && (
        <DriverBoardPagination
          page={currentPage}
          totalPages={totalPages}
          totalResults={filteredSummaries.length}
          onPageChange={(nextPage) => {
            setPageAnchorId(
              filteredSummaries[(nextPage - 1) * PAGE_SIZE]?.driver.id ?? null,
            )
          }}
        />
      )}
    </section>
  )
}
