import { TriangleAlert } from 'lucide-react'
import { canReassignLoad, type DriverSummary } from '../../domain/hos'
import { SelectionCheckbox } from '../ui/SelectionCheckbox'
import { DataFreshness } from './DataFreshness'
import { DriverContactAction } from './DriverContactAction'
import { DriverNudgeAction } from './DriverNudgeAction'
import { DriverRiskStatus } from './DriverRiskStatus'
import { hexAvatar } from './hexStyles'

interface DriverDesktopRowProps {
  summary: DriverSummary
  isSelected: boolean
  isSelectionLocked: boolean
  isNudged: boolean
  onToggleSelect: (driverId: string) => void
  onOpenDriver: (driverId: string) => void
  onRequestNudge: (summary: DriverSummary) => void
}

export function DriverDesktopRow({
  summary,
  isSelected,
  isSelectionLocked,
  isNudged,
  onToggleSelect,
  onOpenDriver,
  onRequestNudge,
}: DriverDesktopRowProps) {
  const isSelectable = canReassignLoad(summary) && !isSelectionLocked

  return (
    <tr className={`group hover:bg-hex-bg/60 ${isSelected ? 'bg-hex-accent/10' : ''}`}>
      <td className="w-14 px-0 py-4 text-center">
        <SelectionCheckbox
          label={`Select ${summary.driver.name} for batch reassignment`}
          checked={isSelected}
          disabled={!isSelectable}
          onChange={() => onToggleSelect(summary.driver.id)}
        />
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span className={`${hexAvatar} size-9 shrink-0 rounded-full`}>
            {summary.driver.initials}
          </span>
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => onOpenDriver(summary.driver.id)}
              className="block text-left font-medium text-hex-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              {summary.driver.name}
            </button>
            <p className="mt-0.5 text-xs text-hex-muted">
              {summary.truck.unitNumber} · {summary.truck.type}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4"><DriverRiskStatus summary={summary} /></td>
      <td className="px-4 py-4">
        {summary.route ? (
          <div>
            <p className="text-sm font-medium text-hex-ink">
              {summary.route.id.toUpperCase()} · {summary.route.loadLabel}
            </p>
            <p className="mt-1 max-w-64 truncate text-xs text-hex-muted">
              {summary.currentDelivery?.customer ?? 'Route complete'}
            </p>
          </div>
        ) : <span className="text-sm text-hex-muted">Unassigned</span>}
      </td>
      <td className="px-4 py-4">
        <p className="flex items-center gap-2 text-sm font-semibold tabular-nums text-hex-ink">
          {summary.projectedOverLimit && (
            <TriangleAlert
              aria-label="Projected to exceed HOS limit"
              size={15}
              className="shrink-0 text-warning"
            />
          )}
          {summary.remainingStops > 0 ? summary.remainingStops : '—'}
        </p>
      </td>
      <td className="px-4 py-4"><DataFreshness summary={summary} /></td>
      <td className="px-4 py-4 text-left">
        <DriverNudgeAction
          summary={summary}
          isNudged={isNudged}
          onRequestNudge={onRequestNudge}
        />
      </td>
      <td className="px-5 py-4 text-left">
        <DriverContactAction summary={summary} />
      </td>
    </tr>
  )
}
