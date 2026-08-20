import { Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatCdtClock } from '../../utils/formatCdtTime'

export function DashboardHeader() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <header className="shrink-0 border-b border-hex-border bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center border border-hex-border bg-white">
            <Truck aria-hidden="true" size={18} className="text-hex-ink" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.12em] text-hex-ink">RELAY</p>
            <p className="mt-0.5 text-xs text-hex-muted">Midwest region</p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <time
            dateTime={now.toISOString()}
            className="whitespace-nowrap text-xs font-medium tabular-nums text-hex-ink sm:text-sm"
          >
            {formatCdtClock(now)}
          </time>
        </div>
      </div>
    </header>
  )
}
