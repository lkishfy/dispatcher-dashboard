import { useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import type { DataFreshness, DriverSummary, HosSeverity } from '../../domain/hos'
import type { DutyStatus } from '../../types/fleet'
import { formatCdtRefreshTime } from '../../utils/formatCdtTime'
import { DriverTable } from './DriverTable'
import { DriverBoardPagination } from './DriverBoardPagination'
import { filterDriverSummaries, getDriverSearchSuggestions } from './driverSearch'
import { FleetFilters } from './FleetFilters'

interface DriverBoardProps {
  summaries: DriverSummary[]
  selectedIds: Set<string>
  lockedDriverIds: Set<string>
  lastRefreshedAt: Date
  isRefreshing: boolean
  onToggleSelect: (driverId: string) => void
  onSetSelection: (driverIds: string[], selected: boolean) => void
  onBatchReassign: () => void
  onOpenDriver: (driverId: string) => void
  onRefresh: () => void
}

const PAGE_SIZE = 10

export function DriverBoard({
  summaries,
  selectedIds,
  lockedDriverIds,
  lastRefreshedAt,
  isRefreshing,
  onToggleSelect,
  onSetSelection,
  onBatchReassign,
  onOpenDriver,
  onRefresh,
}: DriverBoardProps) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<DutyStatus | 'all'>('all')
  const [severity, setSeverity] = useState<HosSeverity | 'all'>('all')
  const [freshness, setFreshness] = useState<DataFreshness | 'all'>('all')
  const [requestedPage, setRequestedPage] = useState(1)

  const searchSuggestions = useMemo(
    () => getDriverSearchSuggestions(summaries),
    [summaries],
  )

  const filteredSummaries = useMemo(() => {
    return filterDriverSummaries(summaries, { search, status, severity, freshness })
  }, [freshness, search, severity, status, summaries])
  const totalPages = Math.max(1, Math.ceil(filteredSummaries.length / PAGE_SIZE))
  const currentPage = Math.min(requestedPage, totalPages)
  const firstVisibleIndex = (currentPage - 1) * PAGE_SIZE
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
        onSearchChange={(value) => { setSearch(value); setRequestedPage(1) }}
        onStatusChange={(value) => { setStatus(value); setRequestedPage(1) }}
        onSeverityChange={(value) => { setSeverity(value); setRequestedPage(1) }}
        onFreshnessChange={(value) => { setFreshness(value); setRequestedPage(1) }}
      />
      <DriverTable
        summaries={visibleSummaries}
        selectedIds={selectedIds}
        lockedDriverIds={lockedDriverIds}
        onToggleSelect={onToggleSelect}
        onSetSelection={onSetSelection}
        onOpenDriver={onOpenDriver}
      />
      {filteredSummaries.length > PAGE_SIZE && (
        <DriverBoardPagination
          page={currentPage}
          pageSize={PAGE_SIZE}
          totalPages={totalPages}
          totalResults={filteredSummaries.length}
          onPageChange={setRequestedPage}
        />
      )}
    </section>
  )
}
