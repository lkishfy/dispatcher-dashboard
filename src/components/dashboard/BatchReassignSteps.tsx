import { Check, ChevronLeft } from 'lucide-react'
import type { DriverSummary } from '../../domain/hos'

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

interface BatchReassignReviewStepProps {
  readySummaries: DriverSummary[]
  unchangedSummaries: DriverSummary[]
  proposedAssignments: Record<string, string>
  summariesById: Map<string, DriverSummary>
}

export function BatchReassignReviewStep({
  readySummaries,
  unchangedSummaries,
  proposedAssignments,
  summariesById,
}: BatchReassignReviewStepProps) {
  return (
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
  )
}

export function BatchReassignConfirmStep({
  assignmentCount,
  unmatchedCount,
}: {
  assignmentCount: number
  unmatchedCount: number
}) {
  return (
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
  )
}

interface BatchReassignFooterProps {
  step: 'review' | 'confirm'
  canContinue: boolean
  onCancel: () => void
  onContinue: () => void
  onBack: () => void
  onConfirm: () => void
}

export function BatchReassignFooter({
  step,
  canContinue,
  onCancel,
  onContinue,
  onBack,
  onConfirm,
}: BatchReassignFooterProps) {
  return (
    <footer className="mt-auto grid grid-cols-2 gap-2 border-t border-hex-border bg-hex-bg/50 p-4 sm:flex sm:justify-end sm:px-6">
      {step === 'review' ? (
        <>
          <button type="button" onClick={onCancel} className="hex-btn-secondary min-h-10">Cancel</button>
          <button type="button" onClick={onContinue} disabled={!canContinue} className="hex-btn-primary min-h-10">
            Continue
          </button>
        </>
      ) : (
        <>
          <button type="button" onClick={onBack} className="hex-btn-secondary min-h-10">
            <ChevronLeft aria-hidden="true" size={14} />
            Back
          </button>
          <button type="button" onClick={onConfirm} className="hex-btn-primary min-h-10">
            Confirm & stage
          </button>
        </>
      )}
    </footer>
  )
}
