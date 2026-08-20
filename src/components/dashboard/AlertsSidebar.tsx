import { Bell, PanelRightClose } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  NotificationCenter,
  type NotificationCenterProps,
} from './NotificationCenter'

type AlertsSidebarProps = Omit<
  NotificationCenterProps,
  'className' | 'headerAction'
> & {
  isOpen: boolean
  nestedContent?: ReactNode
  onExpand: () => void
  onCollapse: () => void
}

export function AlertsSidebar({
  isOpen,
  nestedContent,
  onExpand,
  onCollapse,
  ...alertProps
}: AlertsSidebarProps) {
  const alertCount = alertProps.violations.length
    + alertProps.hosAlerts.length
    + alertProps.verificationDrivers.length

  return (
    <aside
      id="alerts-sidebar"
      className={`relative h-full min-h-0 shrink-0 overflow-hidden border-l border-hex-border bg-white transition-[width] duration-200 ease-out ${
        isOpen
          ? 'w-full border-l border-hex-border sm:w-[min(48rem,50vw)]'
          : 'w-14'
      }`}
    >
      {!isOpen && (
        <button
          type="button"
          onClick={onExpand}
          aria-label={`Open alerts sidebar. ${alertCount} active.`}
          aria-controls="alerts-sidebar-panel"
          aria-expanded={false}
          className="flex h-full w-14 flex-col items-center gap-3 pt-5 text-hex-muted hover:bg-hex-bg hover:text-hex-ink"
        >
          <span className="relative grid size-9 place-items-center border border-hex-border bg-white">
            <Bell aria-hidden="true" size={16} />
            {alertCount > 0 && (
              <span className="absolute -right-2 -top-2 grid min-h-5 min-w-5 place-items-center rounded-full bg-risk-critical px-1 text-[9px] font-semibold tabular-nums text-white">
                {alertCount > 99 ? '99+' : alertCount}
              </span>
            )}
          </span>
          <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-semibold uppercase tracking-[0.12em]">
            Alerts
          </span>
        </button>
      )}
      <div
        id="alerts-sidebar-panel"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`h-full w-screen overflow-hidden sm:w-[min(48rem,50vw)] ${isOpen ? 'block' : 'hidden'}`}
      >
        <div className={`h-full overflow-y-auto ${nestedContent ? 'hidden' : 'block'}`}>
          <NotificationCenter
            {...alertProps}
            className="min-h-full rounded-none border-0 shadow-none"
            headerAction={(
              <button
                type="button"
                onClick={onCollapse}
                aria-label="Hide alerts"
                title="Hide alerts"
                className="grid size-9 shrink-0 place-items-center border border-hex-border bg-white text-hex-muted hover:bg-hex-bg hover:text-hex-ink"
              >
                <PanelRightClose aria-hidden="true" size={16} />
              </button>
            )}
          />
        </div>
        {nestedContent && (
          <div className="h-full overflow-y-auto">
            {nestedContent}
          </div>
        )}
      </div>
    </aside>
  )
}
