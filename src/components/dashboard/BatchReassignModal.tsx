import { ArrowRightLeft, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { indexSummaries } from '../../domain/dashboardSelectors'
import type { DriverSummary } from '../../domain/hos'
import { buildBatchReassignments } from '../../domain/reassignment'
import { AccessibleDialog } from '../ui/AccessibleDialog'
import {
  BatchReassignConfirmStep,
  BatchReassignFooter,
  BatchReassignReviewStep,
} from './BatchReassignSteps'

interface BatchReassignModalProps {
  selectedSummaries: DriverSummary[]
  availableDrivers: DriverSummary[]
  onConfirm: (assignments: Record<string, string>) => void
  onClose: () => void
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
    () => indexSummaries(availableDrivers),
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
            <BatchReassignReviewStep
              readySummaries={readySummaries}
              unchangedSummaries={unchangedSummaries}
              proposedAssignments={proposedAssignments}
              summariesById={summariesById}
            />
          ) : (
            <BatchReassignConfirmStep
              assignmentCount={assignmentCount}
              unmatchedCount={unmatchedCount}
            />
          )}
        </div>

        <BatchReassignFooter
          step={step}
          canContinue={assignmentCount > 0}
          onCancel={onClose}
          onContinue={() => setStep('confirm')}
          onBack={() => setStep('review')}
          onConfirm={() => onConfirm(proposedAssignments)}
        />
      </section>
      </div>
    </AccessibleDialog>
  )
}
