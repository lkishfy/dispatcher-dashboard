import { useState } from 'react'
import { canReassignLoad, type DriverSummary } from '../../domain/hos'
import { SelectionCheckbox } from '../ui/SelectionCheckbox'
import { DriverDesktopRow } from './DriverDesktopRow'
import { DriverMobileCard } from './DriverMobileCard'
import { DriverNudgeDialog } from './DriverNudgeDialog'

interface DriverTableProps {
  summaries: DriverSummary[]
  selectedIds: Set<string>
  lockedDriverIds: Set<string>
  onToggleSelect: (driverId: string) => void
  onSetSelection: (driverIds: string[], selected: boolean) => void
  onOpenDriver: (driverId: string) => void
}

export function DriverTable({
  summaries,
  selectedIds,
  lockedDriverIds,
  onToggleSelect,
  onSetSelection,
  onOpenDriver,
}: DriverTableProps) {
  const [nudgedDriverIds, setNudgedDriverIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [pendingNudge, setPendingNudge] = useState<DriverSummary | null>(null)
  const selectableSummaries = summaries.filter(
    (summary) => canReassignLoad(summary) && !lockedDriverIds.has(summary.driver.id),
  )
  const allSelected = selectableSummaries.length > 0
    && selectableSummaries.every((summary) => selectedIds.has(summary.driver.id))
  const someSelected = !allSelected && selectableSummaries.some(
    (summary) => selectedIds.has(summary.driver.id),
  )

  const toggleAll = () => {
    onSetSelection(
      selectableSummaries.map((summary) => summary.driver.id),
      !allSelected,
    )
  }

  return (
    <div>
      <div className="divide-y divide-hex-border md:hidden">
        {summaries.map((summary) => (
          <DriverMobileCard
            key={summary.driver.id}
            summary={summary}
            isSelected={selectedIds.has(summary.driver.id)}
            isSelectionLocked={lockedDriverIds.has(summary.driver.id)}
            isNudged={nudgedDriverIds.has(summary.driver.id)}
            onToggleSelect={onToggleSelect}
            onOpenDriver={onOpenDriver}
            onRequestNudge={setPendingNudge}
          />
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1000px] border-collapse text-left">
          <thead>
            <tr className="hex-label border-b border-hex-border bg-hex-bg">
              <th className="w-14 px-0 py-3 text-center">
                <SelectionCheckbox
                  label="Select all visible loads for batch reassignment"
                  checked={allSelected}
                  indeterminate={someSelected}
                  disabled={selectableSummaries.length === 0}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-5 py-3 text-left">Driver</th>
              <th className="px-4 py-3 text-left">Risk status</th>
              <th className="px-4 py-3 text-left">Route</th>
              <th className="px-4 py-3 text-left">Remaining stops</th>
              <th className="px-4 py-3 text-left">Nudge</th>
              <th className="px-5 py-3 text-left">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hex-border">
            {summaries.map((summary) => (
              <DriverDesktopRow
                key={summary.driver.id}
                summary={summary}
                isSelected={selectedIds.has(summary.driver.id)}
                isSelectionLocked={lockedDriverIds.has(summary.driver.id)}
                isNudged={nudgedDriverIds.has(summary.driver.id)}
                onToggleSelect={onToggleSelect}
                onOpenDriver={onOpenDriver}
                onRequestNudge={setPendingNudge}
              />
            ))}
          </tbody>
        </table>
      </div>
      {summaries.length === 0 && (
        <div className="px-5 py-14 text-center">
          <p className="text-base font-semibold text-hex-ink">No drivers match these filters</p>
          <p className="mt-1 text-sm text-hex-muted">Try a broader search or clear one of the filters.</p>
        </div>
      )}
      {pendingNudge && (
        <DriverNudgeDialog
          summary={pendingNudge}
          onConfirm={(driverId) => {
            setNudgedDriverIds((current) => new Set(current).add(driverId))
            setPendingNudge(null)
          }}
          onClose={() => setPendingNudge(null)}
        />
      )}
    </div>
  )
}
