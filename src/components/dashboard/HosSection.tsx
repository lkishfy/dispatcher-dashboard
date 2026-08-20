import { Clock3 } from 'lucide-react'
import {
  HOS_DRIVE_LIMIT_MINUTES,
  buildDutyTimeline,
  formatDuration,
  getDutyTotals,
  type DriverSummary,
} from '../../domain/hos'
import type { DutyStatus } from '../../types/fleet'
import { statusLabels } from './display'

const timelineStyles: Record<DutyStatus, string> = {
  driving: 'bg-hex-ink',
  'on-duty': 'bg-hex-muted',
  'on-break': 'bg-risk-unknown',
  'sleeper-berth': 'bg-risk-unknown',
  'off-duty': 'bg-hex-border',
}

interface HosSectionProps {
  summary: DriverSummary
}

export function HosSection({ summary }: HosSectionProps) {
  const dutyTotals = getDutyTotals(summary)
  const timeline = buildDutyTimeline(summary)

  return (
    <section className="hex-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="hex-label">Hours of service</p>
          <h3 className="mt-1 font-semibold text-hex-ink">Today’s duty clock</h3>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-hex-muted">
          <Clock3 aria-hidden="true" size={14} />
          11-hour limit
        </span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {[
          ['Drive used', formatDuration(summary.driveMinutesUsed)],
          ['Drive left', formatDuration(summary.driveMinutesRemaining)],
          ['Break time', dutyTotals ? formatDuration(dutyTotals['on-break']) : 'No data'],
        ].map(([label, value], index) => (
          <div
            key={label}
            className={`rounded-lg bg-hex-bg p-3 ${index === 0 ? 'col-span-2 sm:col-span-1' : ''}`}
          >
            <p className="text-xs text-hex-muted">{label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-hex-ink">
              {value}
            </p>
          </div>
        ))}
      </div>
      {timeline ? (
        <div className="mt-5 space-y-3">
          {timeline.map((segment) => (
            <div
              key={segment.id}
              className="grid grid-cols-[44px_70px_1fr_48px] items-center gap-1.5 text-[11px] sm:grid-cols-[54px_88px_1fr_55px] sm:gap-2 sm:text-xs"
            >
              <span className={`font-medium tabular-nums ${segment.isCurrent ? 'text-hex-ink' : 'text-hex-muted'}`}>
                {segment.label}
              </span>
              <span className="font-semibold text-hex-ink">
                {statusLabels[segment.status]}
              </span>
              <div className="h-2 overflow-hidden rounded-full bg-hex-border/30">
                <div
                  className={`h-full min-w-1 rounded-full ${timelineStyles[segment.status]}`}
                  style={{
                    width: `${Math.min(100, (segment.durationMinutes / HOS_DRIVE_LIMIT_MINUTES) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-right tabular-nums text-hex-muted">
                {formatDuration(segment.durationMinutes)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-hex-border bg-hex-bg p-5 text-center">
          <p className="font-semibold text-hex-ink">No duty log received</p>
          <p className="mt-1 text-sm text-hex-muted">
            Do not interpret this as zero drive time.
          </p>
        </div>
      )}
    </section>
  )
}
