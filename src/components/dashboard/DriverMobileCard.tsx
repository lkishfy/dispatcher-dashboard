import { canReassignLoad } from '../../domain/hos'
import { SelectionCheckbox } from '../ui/SelectionCheckbox'
import { DataFreshness } from './DataFreshness'
import { DriverAlertBadge } from './DriverAlertBadge'
import { DriverContactAction } from './DriverContactAction'
import { DriverNudgeAction } from './DriverNudgeAction'
import { DriverRiskStatus } from './DriverRiskStatus'
import type { DriverRowProps } from './driverRowProps'
import { statusLabels } from './display'
import { hexAvatar } from './hexStyles'

export function DriverMobileCard({
  summary,
  isSelected,
  isSelectionLocked,
  isNudged,
  onToggleSelect,
  onOpenDriver,
  onRequestNudge,
}: DriverRowProps) {
  const isSelectable = canReassignLoad(summary) && !isSelectionLocked

  return (
    <article className="bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`${hexAvatar} size-9 shrink-0 rounded-full`}>
            {summary.driver.initials}
          </span>
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => onOpenDriver(summary.driver.id)}
              className="block max-w-full truncate text-left text-sm font-medium text-hex-ink"
            >
              {summary.driver.name}
            </button>
            <p className="mt-0.5 truncate text-xs text-hex-muted">
              {summary.truck.unitNumber} · {statusLabels[summary.driver.status]}
            </p>
            <DriverAlertBadge summary={summary} />
          </div>
        </div>
        <SelectionCheckbox
          label={`Select ${summary.driver.name} for batch reassignment`}
          checked={isSelected}
          disabled={!isSelectable}
          onChange={() => onToggleSelect(summary.driver.id)}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-md bg-hex-bg p-3">
        <div>
          <p className="hex-label">Risk status</p>
          <div className="mt-1"><DriverRiskStatus summary={summary} /></div>
        </div>
        <div>
          <p className="hex-label">Connection</p>
          <div className="mt-1"><DataFreshness summary={summary} /></div>
        </div>
      </div>
      <div className="mt-3">
        <p className="min-w-0 truncate text-xs text-hex-muted">
          {summary.route
            ? `${summary.route.loadLabel} · ${summary.remainingStops} stops left`
            : 'Unassigned'}
        </p>
      </div>
      <div className="mt-3 flex gap-2">
        <DriverNudgeAction
          summary={summary}
          isNudged={isNudged}
          className="flex-1"
          onRequestNudge={onRequestNudge}
        />
        <DriverContactAction summary={summary} className="flex-1" />
      </div>
    </article>
  )
}
