import type { DriverSummary } from '../../domain/hos'
import { DriverDetailHeader } from './DriverDetailHeader'
import { DriverGuidanceBanner } from './DriverGuidanceBanner'
import { HosSection } from './HosSection'
import { LoadSection } from './LoadSection'
import { ReassignmentSection } from './ReassignmentSection'

interface ReassignmentDetail {
  candidates: DriverSummary[]
  stagedReplacement: DriverSummary | null
  confirmedReplacement: DriverSummary | null
  onStage: (fromDriverId: string, toDriverId: string) => void
  onConfirm: (fromDriverId: string) => void
  onUndo: (fromDriverId: string) => void
}

export interface DriverDetailContentProps {
  summary: DriverSummary
  reassignment: ReassignmentDetail
  onClose: () => void
}

export function DriverDetailContent({
  summary,
  reassignment,
  onClose,
}: DriverDetailContentProps) {
  return (
    <div className="min-h-full bg-hex-bg">
      <DriverDetailHeader summary={summary} onClose={onClose} />
      <div className="space-y-4 p-4 sm:space-y-5 sm:p-5 lg:p-7">
        <DriverGuidanceBanner summary={summary} />
        <ReassignmentSection
          summary={summary}
          candidates={reassignment.candidates}
          stagedReplacement={reassignment.stagedReplacement}
          confirmedReplacement={reassignment.confirmedReplacement}
          onStage={reassignment.onStage}
          onConfirm={reassignment.onConfirm}
          onUndo={reassignment.onUndo}
        />
        <HosSection summary={summary} />
        <LoadSection summary={summary} />
      </div>
    </div>
  )
}
