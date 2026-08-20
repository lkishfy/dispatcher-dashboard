import { BatchReassignModal } from './components/dashboard/BatchReassignModal'
import { DashboardHeader } from './components/dashboard/DashboardHeader'
import { DriverDetailContent } from './components/dashboard/DriverDetailContent'
import { DriverDetailPanel } from './components/dashboard/DriverDetailPanel'
import { DriverBoard } from './components/dashboard/DriverBoard'
import { AlertsSidebar } from './components/dashboard/AlertsSidebar'
import { hexPage } from './components/dashboard/hexStyles'
import { useDashboardController } from './hooks/useDashboardController'
import fleetJson from './data/fleet.json'
import { parseFleetData } from './domain/parseFleetData'

const fleet = parseFleetData(fleetJson)

function App() {
  const dashboard = useDashboardController(fleet)

  return (
    <div className={`${hexPage} flex h-dvh flex-col overflow-hidden`}>
      <DashboardHeader />

      <div className="flex min-h-0 flex-1 items-stretch overflow-hidden">
        <main className="relative h-full min-w-0 flex-1 overflow-hidden">
          <div
            inert={dashboard.alerts.isOpen}
            className="h-full overflow-y-auto"
          >
            <div className="mx-auto max-w-[1500px] space-y-5 px-3 py-5 sm:space-y-6 sm:px-5 sm:py-8 lg:px-8 lg:py-10">
              <DriverBoard
                summaries={dashboard.board.summaries}
                selectedIds={dashboard.board.selectedIds}
                lockedDriverIds={dashboard.board.lockedDriverIds}
                lastRefreshedAt={dashboard.board.lastRefreshedAt}
                isRefreshing={dashboard.board.isRefreshing}
                onToggleSelect={dashboard.board.onToggleSelect}
                onSetSelection={dashboard.board.onSetSelection}
                onBatchReassign={dashboard.board.onOpenBatch}
                onOpenDriver={dashboard.board.onOpenDriver}
                onRefresh={dashboard.board.onRefresh}
              />
            </div>
          </div>
          {dashboard.alerts.isOpen && (
            <button
              type="button"
              onClick={dashboard.alerts.onCollapse}
              aria-label="Hide alerts and return to Driver Board"
              className="absolute inset-0 z-20 cursor-default bg-hex-overlay/15"
            />
          )}
        </main>

        <AlertsSidebar
          isOpen={dashboard.alerts.isOpen}
          violations={dashboard.alerts.violations}
          hosAlerts={dashboard.alerts.hosAlertDrivers}
          verificationDrivers={dashboard.alerts.verificationDrivers}
          onDismissViolation={dashboard.alerts.onDismissViolation}
          onDismissVerification={dashboard.alerts.onDismissVerification}
          onOpenDriver={dashboard.alerts.onOpenDriver}
          nestedContent={dashboard.detail.props && dashboard.detail.selectedDriver?.origin === 'alerts' ? (
            <DriverDetailContent
              key={dashboard.detail.selectedDriver.id}
              {...dashboard.detail.props}
            />
          ) : undefined}
          onExpand={dashboard.alerts.onExpand}
          onCollapse={dashboard.alerts.onCollapse}
        />
      </div>

      {dashboard.detail.selectedDriver && dashboard.detail.props && dashboard.detail.selectedDriver.origin !== 'alerts' && (
        <DriverDetailPanel
          key={dashboard.detail.selectedDriver.id}
          {...dashboard.detail.props}
        />
      )}

      {dashboard.batch.isOpen && (
        <BatchReassignModal
          selectedSummaries={dashboard.batch.selectedSummaries}
          availableDrivers={dashboard.batch.availableDrivers}
          onConfirm={dashboard.batch.onConfirm}
          onClose={dashboard.batch.onClose}
        />
      )}
    </div>
  )
}

export default App
