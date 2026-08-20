import { ArrowRightLeft, Check, ChevronLeft, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { DriverSummary } from '../../domain/hos'
import { buildBatchReassignments } from '../../domain/reassignment'
import { AccessibleDialog } from '../ui/AccessibleDialog'

interface BatchReassignModalProps {
  selectedSummaries: DriverSummary[]
  availableDrivers: DriverSummary[]
  onConfirm: (assignments: Record<string, string>) => void
  onClose: () => void
}

function AssignmentRow({
  summary,
  replacement,
}: {
  summary: DriverSummary
  replacement?: DriverSummary
}) {
  return (
    <li className={`rounded-lg border border-hex-border p-3 ${replacement ? 'bg-white' : 'bg-hex-bg/70'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`truncate text-sm font-medium ${replacement ? 'text-hex-ink' : 'text-hex-muted'}`}>
            {summary.route?.loadLabel} · {summary.driver.name}
          </p>
          <p className="mt-1 text-xs text-hex-muted">
            {replacement
              ? `Reassign to ${replacement.driver.name} · ${replacement.truck.unitNumber}`
              : 'Current assignment will remain unchanged'}
          </p>
        </div>
        {replacement ? (
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-hex-ink text-white">
            <Check aria-hidden="true" size={14} />
          </span>
        ) : (
          <span className="shrink-0 rounded-full border border-hex-border bg-white px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-hex-muted">
            Unchanged
          </span>
        )}
      </div>
    </li>
  )
}

export function BatchReassignModal({
  selectedSummaries,
  availableDrivers,
  onConfirm,
  onClose,
}: BatchReassignModalProps) {
  const [step, setStep] = useState<'review' | 'confirm'>('review')
  const proposedAssignments = useMemo(
    () => buildBatchReassignments(selectedSummaries, availableDrivers),
    [availableDrivers, selectedSummaries],
  )
  const summariesById = useMemo(
    () => new Map(availableDrivers.map((summary) => [summary.driver.id, summary])),
    [availableDrivers],
  )
  const assignmentCount = Object.keys(proposedAssignments).length
  const unmatchedCount = selectedSummaries.length - assignmentCount
  const readySummaries = selectedSummaries.filter(
    (summary) => summary.driver.id in proposedAssignments,
  )
  const unchangedSummaries = selectedSummaries.filter(
    (summary) => !(summary.driver.id in proposedAssignments),
  )

  return (
    <AccessibleDialog
      labelledBy="batch-reassign-title"
      describedBy="batch-reassign-description"
      onClose={onClose}
      className="z-50"
    >
      <div className="grid h-full place-items-end sm:place-items-center">
      <section
        className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-dialog bg-white shadow-dialog sm:max-w-xl sm:rounded-dialog"
      >
        <header className="flex items-start justify-between gap-4 border-b border-hex-border px-4 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <ArrowRightLeft aria-hidden="true" size={18} className="text-hex-muted" />
              <h2 id="batch-reassign-title" className="text-base font-semibold text-hex-ink">
                Batch reassign
              </h2>
            </div>
            <p id="batch-reassign-description" className="mt-1 text-xs text-hex-muted">
              Step {step === 'review' ? '1 of 2 · Review pairings' : '2 of 2 · Confirm changes'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-10 shrink-0 place-items-center rounded-md border border-hex-border bg-white text-hex-muted hover:bg-hex-bg hover:text-hex-ink"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </header>

        <div className="overflow-y-auto p-4 sm:p-6">
          {step === 'review' ? (
            <>
              <p className="text-sm text-hex-muted">
                We paired each selected load with an eligible available driver where possible.
              </p>

              {readySummaries.length > 0 && (
                <section aria-labelledby="ready-reassignments-heading" className="mt-5">
                  <h3 id="ready-reassignments-heading" className="text-sm font-semibold text-hex-ink">
                    Ready to reassign
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {readySummaries.map((summary) => (
                      <AssignmentRow
                        key={summary.driver.id}
                        summary={summary}
                        replacement={summariesById.get(proposedAssignments[summary.driver.id])}
                      />
                    ))}
                  </ul>
                </section>
              )}

              {unchangedSummaries.length > 0 && (
                <section aria-labelledby="unchanged-loads-heading" className="mt-5 border-t border-hex-border pt-5">
                  <h3 id="unchanged-loads-heading" className="text-sm font-semibold text-hex-ink">
                    No eligible driver found
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-hex-muted">
                    Nothing will happen to these loads. Their current driver assignments will remain unchanged.
                  </p>
                  <ul className="mt-3 space-y-2">
                    {unchangedSummaries.map((summary) => (
                      <AssignmentRow key={summary.driver.id} summary={summary} />
                    ))}
                  </ul>
                </section>
              )}
            </>
          ) : (
            <div className="py-4 text-center">
              <span className="mx-auto grid size-11 place-items-center rounded-full bg-hex-ink text-white">
                <Check aria-hidden="true" size={20} />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-hex-ink">
                Stage {assignmentCount} reassignment{assignmentCount === 1 ? '' : 's'}?
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-hex-muted">
                Loads will be prepared for dispatch confirmation. This prototype does not contact replacement drivers automatically.
              </p>
              {unmatchedCount > 0 && (
                <p className="mx-auto mt-3 max-w-sm text-xs text-hex-muted">
                  {unmatchedCount} load{unmatchedCount === 1 ? '' : 's'} without an eligible replacement will remain unchanged.
                </p>
              )}
            </div>
          )}
        </div>

        <footer className="mt-auto grid grid-cols-2 gap-2 border-t border-hex-border bg-hex-bg/50 p-4 sm:flex sm:justify-end sm:px-6">
          {step === 'review' ? (
            <>
              <button type="button" onClick={onClose} className="hex-btn-secondary min-h-10">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep('confirm')}
                disabled={assignmentCount === 0}
                className="hex-btn-primary min-h-10"
              >
                Continue
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep('review')}
                className="hex-btn-secondary inline-flex min-h-10 items-center justify-center gap-1"
              >
                <ChevronLeft aria-hidden="true" size={14} />
                Back
              </button>
              <button
                type="button"
                onClick={() => onConfirm(proposedAssignments)}
                className="hex-btn-primary min-h-10"
              >
                Confirm & stage
              </button>
            </>
          )}
        </footer>
      </section>
      </div>
    </AccessibleDialog>
  )
}
