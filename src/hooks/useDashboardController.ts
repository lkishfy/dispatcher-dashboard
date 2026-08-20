import { useMemo, useState } from 'react'
import {
  getExcludedReplacementIds,
  getHosAlertDrivers,
  getLockedDriverIds,
  getVisibleVerificationDrivers,
  getVisibleViolations,
  indexSummaries,
} from '../domain/dashboardSelectors'
import { canReassignLoad, type DriverSummary } from '../domain/hos'
import { getAvailableDrivers, getReassignmentCandidates } from '../domain/reassignment'
import type { FleetData } from '../types/fleet'
import { useFleetSnapshot } from './useFleetSnapshot'
import { useReassignmentWorkflow } from './useReassignmentWorkflow'

type SelectedDriver = {
  id: string
  origin: 'alerts' | 'board'
}

export function useDashboardController(initialFleet: FleetData) {
  const [selectedDriver, setSelectedDriver] = useState<SelectedDriver | null>(null)
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
  } = useFleetSnapshot(initialFleet)

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
  const selectedSummary = selectedDriver
    ? summariesById.get(selectedDriver.id)
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
  const batchSelectedSummaries = useMemo(
    () => [...workflow.selected]
      .map((driverId) => summariesById.get(driverId))
      .filter((summary): summary is DriverSummary => (
        summary !== undefined && canReassignLoad(summary)
      )),
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

  const closeSelectedDriver = () => setSelectedDriver(null)
  const collapseAlerts = () => {
    setIsAlertsSidebarOpen(false)
    if (selectedDriver?.origin === 'alerts') closeSelectedDriver()
  }

  const selectedDriverDetailProps = selectedSummary ? {
    summary: selectedSummary,
    reassignment: {
      candidates: detailCandidates,
      stagedReplacement: workflow.staged[selectedSummary.driver.id]
        ? summariesById.get(workflow.staged[selectedSummary.driver.id]) ?? null
        : null,
      confirmedReplacement: workflow.confirmed[selectedSummary.driver.id]
        ? summariesById.get(workflow.confirmed[selectedSummary.driver.id]) ?? null
        : null,
      onStage: workflow.stage,
      onConfirm: workflow.confirm,
      onUndo: workflow.undo,
    },
    onClose: closeSelectedDriver,
  } : null

  return {
    board: {
      summaries,
      selectedIds: workflow.selected,
      lockedDriverIds,
      lastRefreshedAt,
      isRefreshing,
      onToggleSelect: workflow.toggleSelection,
      onSetSelection: workflow.setSelection,
      onOpenDriver: (driverId: string) => setSelectedDriver({ id: driverId, origin: 'board' }),
      onRefresh: refresh,
      onOpenBatch: () => setIsBatchModalOpen(true),
    },
    alerts: {
      isOpen: isAlertsSidebarOpen,
      violations,
      hosAlertDrivers,
      verificationDrivers,
      onDismissViolation: (driverId: string) => {
        setDismissedViolationIds((current) => new Set(current).add(driverId))
      },
      onDismissVerification: (driverId: string) => {
        setDismissedVerificationIds((current) => new Set(current).add(driverId))
      },
      onOpenDriver: (driverId: string) => setSelectedDriver({ id: driverId, origin: 'alerts' }),
      onExpand: () => setIsAlertsSidebarOpen(true),
      onCollapse: collapseAlerts,
    },
    detail: {
      selectedDriver,
      props: selectedDriverDetailProps,
    },
    batch: {
      isOpen: isBatchModalOpen,
      selectedSummaries: batchSelectedSummaries,
      availableDrivers: reassignmentCandidates,
      onConfirm: (assignments: Record<string, string>) => {
        workflow.stageBatch(assignments)
        setIsBatchModalOpen(false)
      },
      onClose: () => setIsBatchModalOpen(false),
    },
  }
}
