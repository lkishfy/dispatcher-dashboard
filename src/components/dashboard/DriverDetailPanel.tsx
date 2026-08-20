import { AlertOctagon, ShieldAlert } from 'lucide-react'
import { getNextLegalAction, formatDuration, type DriverSummary } from '../../domain/hos'
import { AccessibleDialog } from '../ui/AccessibleDialog'
import { DriverContactActions } from './DriverContactActions'
import { DriverDetailHeader } from './DriverDetailHeader'
import { HosSection } from './HosSection'
import { LoadSection } from './LoadSection'
import { ReassignmentSection } from './ReassignmentSection'
import { severityStyles } from './display'

export interface DriverDetailContentProps {
  summary: DriverSummary
  reassignmentCandidates: DriverSummary[]
  stagedReplacement: DriverSummary | null
  confirmedReplacement: DriverSummary | null
  onStageReassign: (fromDriverId: string, toDriverId: string) => void
  onConfirmReassign: (fromDriverId: string) => void
  onUndoReassign: (fromDriverId: string) => void
  onClose: () => void
}

export function DriverDetailContent({
  summary,
  reassignmentCandidates,
  stagedReplacement,
  confirmedReplacement,
  onStageReassign,
  onConfirmReassign,
  onUndoReassign,
  onClose,
}: DriverDetailContentProps) {
  return (
    <div className="min-h-full bg-hex-bg">
      <DriverDetailHeader summary={summary} onClose={onClose} />
      <div className="space-y-4 p-4 sm:space-y-5 sm:p-5 lg:p-7">
        <section className={`rounded-xl border p-4 ${
          summary.severity === 'normal'
            ? 'border-hex-border bg-hex-bg text-hex-ink'
            : severityStyles[summary.severity]
        }`}>
          <div className="flex items-start gap-3">
            {summary.severity === 'violation'
              ? <AlertOctagon aria-hidden="true" className="mt-0.5 shrink-0" size={20} />
              : <ShieldAlert aria-hidden="true" className="mt-0.5 shrink-0" size={20} />}
            <div>
              <p className="font-semibold">{getNextLegalAction(summary)}</p>
              <p className="mt-1 text-sm opacity-80">
                {summary.projectedOverLimit && summary.route && summary.driveMinutesRemaining !== null
                  ? `Current route requires ${formatDuration(summary.route.estimatedDriveMinutesRemaining)} of driving, exceeding available time by ${summary.route.estimatedDriveMinutesRemaining - summary.driveMinutesRemaining}m.`
                  : 'This guidance is calculated from today’s duty log and the 11-hour drive limit.'}
              </p>
              {summary.severity === 'violation' && summary.driver.status === 'driving' && (
                <DriverContactActions driverId={summary.driver.id} driverName={summary.driver.name} online={summary.driver.telemetry.online} />
              )}
            </div>
          </div>
        </section>
        <HosSection summary={summary} />
        <LoadSection summary={summary} />
        <ReassignmentSection
          summary={summary}
          candidates={reassignmentCandidates}
          stagedReplacement={stagedReplacement}
          confirmedReplacement={confirmedReplacement}
          onStage={onStageReassign}
          onConfirm={onConfirmReassign}
          onUndo={onUndoReassign}
        />
      </div>
    </div>
  )
}

export function DriverDetailPanel(props: DriverDetailContentProps) {
  return (
    <AccessibleDialog
      labelledBy="driver-detail-title"
      describedBy="driver-detail-description"
      onClose={props.onClose}
      className="z-50"
    >
      <div className="flex h-full justify-end">
        <aside className="relative h-full w-full max-w-2xl overflow-y-auto bg-hex-bg shadow-dialog">
          <DriverDetailContent {...props} />
        </aside>
      </div>
    </AccessibleDialog>
  )
}
