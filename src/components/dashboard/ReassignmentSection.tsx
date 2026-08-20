import { ArrowRightLeft } from 'lucide-react'
import type { DriverSummary } from '../../domain/hos'
import { ConfirmedReassignment } from './ConfirmedReassignment'
import { ReassignmentCandidates } from './ReassignmentCandidates'
import { StagedReassignment } from './StagedReassignment'

interface ReassignmentSectionProps {
  summary: DriverSummary
  candidates: DriverSummary[]
  stagedReplacement: DriverSummary | null
  confirmedReplacement: DriverSummary | null
  onStage: (fromDriverId: string, toDriverId: string) => void
  onConfirm: (fromDriverId: string) => void
  onUndo: (fromDriverId: string) => void
}

export function ReassignmentSection({
  summary,
  candidates,
  stagedReplacement,
  confirmedReplacement,
  onStage,
  onConfirm,
  onUndo,
}: ReassignmentSectionProps) {
  return (
    <section className="hex-card p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <ArrowRightLeft aria-hidden="true" size={18} className="text-hex-muted" />
        <div>
          <h3 className="font-semibold text-hex-ink">Reassignment options</h3>
          <p className="text-xs text-hex-muted">
            Available drivers ranked by distance to the hub
          </p>
        </div>
      </div>
      {confirmedReplacement ? (
        <ConfirmedReassignment
          summary={summary}
          replacement={confirmedReplacement}
          onUndo={onUndo}
        />
      ) : stagedReplacement ? (
        <StagedReassignment
          summary={summary}
          replacement={stagedReplacement}
          onConfirm={onConfirm}
        />
      ) : (
        <ReassignmentCandidates
          summary={summary}
          candidates={candidates}
          onStage={onStage}
        />
      )}
    </section>
  )
}
