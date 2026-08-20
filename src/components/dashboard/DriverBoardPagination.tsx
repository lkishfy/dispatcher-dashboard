import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DriverBoardPaginationProps {
  page: number
  pageSize: number
  totalPages: number
  totalResults: number
  onPageChange: (page: number) => void
}

export function DriverBoardPagination({
  page,
  pageSize,
  totalPages,
  totalResults,
  onPageChange,
}: DriverBoardPaginationProps) {
  const firstResult = (page - 1) * pageSize + 1
  const lastResult = Math.min(page * pageSize, totalResults)

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
          className="hex-btn-secondary h-9 px-3 text-xs"
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
          className="hex-btn-secondary h-9 px-3 text-xs"
        >
          Next
          <ChevronRight aria-hidden="true" size={14} />
        </button>
      </div>
    </nav>
  )
}
