import { useMemo, useState } from 'react'
import { BatchReassignModal } from './components/dashboard/BatchReassignModal'
import { DashboardHeader } from './components/dashboard/DashboardHeader'
import {
  DriverDetailContent,
  DriverDetailPanel,
} from './components/dashboard/DriverDetailPanel'
import { DriverBoard } from './components/dashboard/DriverBoard'
import { AlertsSidebar } from './components/dashboard/AlertsSidebar'
import {
  canReassignLoad,
} from './domain/hos'
import {
  getExcludedReplacementIds,
  getHosAlertDrivers,
  getLockedDriverIds,
  getVisibleVerificationDrivers,
  getVisibleViolations,
  indexSummaries,
} from './domain/dashboardSelectors'
import { getAvailableDrivers, getReassignmentCandidates } from './domain/reassignment'
import { hexPage } from './components/dashboard/hexStyles'
import { useFleetSnapshot } from './hooks/useFleetSnapshot'
import { useReassignmentWorkflow } from './hooks/useReassignmentWorkflow'
import fleetJson from './data/fleet.json'
import { parseFleetData } from './domain/parseFleetData'

const fleet = parseFleetData(fleetJson)

function App() {
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)
  const [selectedDriverOrigin, setSelectedDriverOrigin] = useState<'alerts' | 'board' | null>(null)
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false)
  const [isAlertsSidebarOpen, setIsAlertsSidebarOpen] = useState(false)
  const [dismissedViolationIds, setDismissedViolationIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [dismissedVerificationIds, setDismissedVerificationIds] = useState<Set<string>>(
    () => new Set(),
  )
  const workflow = useReassignmentWorkflow()
  const {
    summaries,
    lastRefreshedAt,
    isRefreshing,
    refresh,
  } = useFleetSnapshot(fleet)

  const violations = useMemo(
    () => getVisibleViolations(summaries, dismissedViolationIds),
    [dismissedViolationIds, summaries],
  )

  const hosAlertDrivers = useMemo(
    () => getHosAlertDrivers(summaries),
    [summaries],
  )

  const verificationDrivers = useMemo(
    () => getVisibleVerificationDrivers(summaries, dismissedVerificationIds),
    [dismissedVerificationIds, summaries],
  )

  const summariesById = useMemo(() => indexSummaries(summaries), [summaries])
  const selectedSummary = selectedDriverId
    ? summariesById.get(selectedDriverId)
    : undefined

  const excludedReplacementIds = useMemo(
    () => getExcludedReplacementIds(
      workflow.selected,
      workflow.staged,
      workflow.confirmed,
    ),
    [workflow.confirmed, workflow.selected, workflow.staged],
  )

  const reassignmentCandidates = useMemo(
    () => getAvailableDrivers(summaries, excludedReplacementIds),
    [excludedReplacementIds, summaries],
  )

  const selectedForBatch = useMemo(
    () => [...workflow.selected]
      .map((driverId) => summariesById.get(driverId))
      .filter((summary) => summary !== undefined),
    [summariesById, workflow.selected],
  )

  const lockedDriverIds = useMemo(
    () => getLockedDriverIds(workflow.staged, workflow.confirmed),
    [workflow.confirmed, workflow.staged],
  )

  const detailCandidates = useMemo(
    () => selectedSummary
      ? getReassignmentCandidates(selectedSummary, summaries, excludedReplacementIds)
      : [],
    [excludedReplacementIds, selectedSummary, summaries],
  )

  const stagedReplacementForSelected = selectedSummary && workflow.staged[selectedSummary.driver.id]
    ? summariesById.get(workflow.staged[selectedSummary.driver.id]) ?? null
    : null

  const confirmedReplacementForSelected = selectedSummary && workflow.confirmed[selectedSummary.driver.id]
    ? summariesById.get(workflow.confirmed[selectedSummary.driver.id]) ?? null
    : null

  return (
    <div className={`${hexPage} flex h-dvh flex-col overflow-hidden`}>
      <DashboardHeader />

      <div className="flex min-h-0 flex-1 items-stretch overflow-hidden">
        <main className="relative h-full min-w-0 flex-1 overflow-hidden">
          <div
            inert={isAlertsSidebarOpen}
            className="h-full overflow-y-auto"
          >
            <div className="mx-auto max-w-[1500px] space-y-5 px-3 py-5 sm:space-y-6 sm:px-5 sm:py-8 lg:px-8 lg:py-10">
              <DriverBoard
                summaries={summaries}
                selectedIds={workflow.selected}
                lockedDriverIds={lockedDriverIds}
                lastRefreshedAt={lastRefreshedAt}
                isRefreshing={isRefreshing}
                onToggleSelect={workflow.toggleSelection}
                onBatchReassign={() => setIsBatchModalOpen(true)}
                onOpenDriver={(driverId) => {
                  setSelectedDriverOrigin('board')
                  setSelectedDriverId(driverId)
                }}
                onRefresh={refresh}
              />
            </div>
          </div>
          {isAlertsSidebarOpen && (
            <button
              type="button"
              onClick={() => {
                setIsAlertsSidebarOpen(false)
                if (selectedDriverOrigin === 'alerts') {
                  setSelectedDriverId(null)
                  setSelectedDriverOrigin(null)
                }
              }}
              aria-label="Hide alerts and return to Driver Board"
              className="absolute inset-0 z-20 cursor-default bg-hex-overlay/15"
            />
          )}
        </main>

        <AlertsSidebar
          isOpen={isAlertsSidebarOpen}
          violations={violations}
          hosAlerts={hosAlertDrivers}
          verificationDrivers={verificationDrivers}
          onDismissViolation={(driverId) => {
            setDismissedViolationIds((current) => new Set(current).add(driverId))
          }}
          onDismissVerification={(driverId) => {
            setDismissedVerificationIds((current) => new Set(current).add(driverId))
          }}
          onOpenDriver={(driverId) => {
            setSelectedDriverOrigin('alerts')
            setSelectedDriverId(driverId)
          }}
          onReassign={(driverId) => {
            setSelectedDriverOrigin('alerts')
            setSelectedDriverId(driverId)
          }}
          nestedContent={selectedSummary && selectedDriverOrigin === 'alerts' ? (
            <DriverDetailContent
              summary={selectedSummary}
              reassignmentCandidates={detailCandidates}
              stagedReplacement={stagedReplacementForSelected}
              confirmedReplacement={confirmedReplacementForSelected}
              onStageReassign={workflow.stage}
              onConfirmReassign={workflow.confirm}
              onUndoReassign={workflow.undo}
              onClose={() => {
                setSelectedDriverId(null)
                setSelectedDriverOrigin(null)
              }}
            />
          ) : undefined}
          onExpand={() => setIsAlertsSidebarOpen(true)}
          onCollapse={() => {
            setIsAlertsSidebarOpen(false)
            if (selectedDriverOrigin === 'alerts') {
              setSelectedDriverId(null)
              setSelectedDriverOrigin(null)
            }
          }}
        />
      </div>

      {selectedSummary && selectedDriverOrigin !== 'alerts' && (
        <DriverDetailPanel
          summary={selectedSummary}
          reassignmentCandidates={detailCandidates}
          stagedReplacement={stagedReplacementForSelected}
          confirmedReplacement={confirmedReplacementForSelected}
          onStageReassign={workflow.stage}
          onConfirmReassign={workflow.confirm}
          onUndoReassign={workflow.undo}
          onClose={() => {
            setSelectedDriverId(null)
            setSelectedDriverOrigin(null)
          }}
        />
      )}

      {isBatchModalOpen && (
        <BatchReassignModal
          selectedSummaries={selectedForBatch.filter(canReassignLoad)}
          availableDrivers={reassignmentCandidates}
          onConfirm={(assignments) => {
            workflow.stageBatch(assignments)
            setIsBatchModalOpen(false)
          }}
          onClose={() => setIsBatchModalOpen(false)}
        />
      )}
    </div>
  )
}

export default App
