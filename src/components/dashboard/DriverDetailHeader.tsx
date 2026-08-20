import { X } from 'lucide-react'
import type { DriverSummary } from '../../domain/hos'
import { severityLabels, severityStyles, statusLabels } from './display'
import { hexAvatar } from './hexStyles'

interface DriverDetailHeaderProps {
  summary: DriverSummary
  onClose: () => void
}

export function DriverDetailHeader({
  summary,
  onClose,
}: DriverDetailHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-hex-border bg-white/90 px-4 py-3 backdrop-blur sm:px-5 sm:py-4 lg:px-7">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <span className={`${hexAvatar} hidden size-11 shrink-0 rounded-full text-sm min-[390px]:grid`}>
            {summary.driver.initials}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="driver-detail-title" className="text-lg font-semibold text-hex-ink">
                {summary.driver.name}
              </h2>
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${severityStyles[summary.severity]}`}>
                {severityLabels[summary.severity]}
              </span>
            </div>
            <p id="driver-detail-description" className="mt-1 truncate text-xs text-hex-muted sm:text-sm">
              {summary.truck.unitNumber} · {statusLabels[summary.driver.status]} · {summary.driver.location}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="grid size-10 shrink-0 place-items-center border border-hex-border bg-white text-hex-muted hover:bg-hex-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          <X aria-hidden="true" size={18} />
        </button>
      </div>
    </header>
  )
}
