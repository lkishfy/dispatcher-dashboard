import type { NotificationKind } from './NotificationListItem'

export type NotificationFilter = 'all' | NotificationKind

const filters: Array<{ value: NotificationFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'violation', label: 'Critical' },
  { value: 'hos', label: 'HOS' },
  { value: 'verification', label: 'Verify' },
]

interface NotificationFilterBarProps {
  selectedFilter: NotificationFilter
  counts: Record<NotificationFilter, number>
  onChange: (filter: NotificationFilter) => void
}

export function NotificationFilterBar({
  selectedFilter,
  counts,
  onChange,
}: NotificationFilterBarProps) {
  return (
    <div role="group" aria-label="Filter alerts" className="mt-4 grid grid-cols-4 border border-hex-border bg-hex-bg">
      {filters.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={selectedFilter === option.value}
          onClick={() => onChange(option.value)}
          className={`min-h-9 border-r border-hex-border px-2 text-xs font-medium transition-colors last:border-r-0 ${
            selectedFilter === option.value
              ? 'bg-white text-hex-ink'
              : 'text-hex-muted hover:text-hex-ink'
          }`}
        >
          {option.label} <span className="tabular-nums">{counts[option.value]}</span>
        </button>
      ))}
    </div>
  )
}
