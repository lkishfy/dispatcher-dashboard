import { BellRing, Phone } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { formatCdtRefreshTime } from '../../utils/formatCdtTime'
import {
  getDriverPhone,
  violationStopPingMessage,
  type ContactActionStatus,
} from '../../utils/driverContact'

interface DriverContactActionsProps {
  driverId: string
  driverName: string
  online: boolean
  variant?: 'banner' | 'compact'
}

function statusMessage(action: ContactActionStatus, driverName: string, phone: string): string {
  const time = formatCdtRefreshTime(action.at)

  if (action.type === 'call') {
    if (action.phase === 'pending') return `Calling ${phone}…`
    if (action.phase === 'connected') return `Connected to ${driverName} · ${time}`
    return `Could not reach ${driverName} · ${time}`
  }

  if (action.phase === 'pending') return `Sending in-cab alert to ${driverName}…`
  if (action.phase === 'delivered') return `In-cab alert delivered · ${time}`
  return `In-cab alert failed — driver may be offline · ${time}`
}

export function DriverContactActions({
  driverId,
  driverName,
  online,
  variant = 'banner',
}: DriverContactActionsProps) {
  const phone = getDriverPhone(driverId)
  const [lastAction, setLastAction] = useState<ContactActionStatus | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const actionTimerRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (actionTimerRef.current !== null) {
      window.clearTimeout(actionTimerRef.current)
    }
  }, [])

  const startCall = () => {
    if (isBusy) return
    setIsBusy(true)
    const startedAt = new Date()
    setLastAction({ type: 'call', at: startedAt, phase: 'pending' })

    actionTimerRef.current = window.setTimeout(() => {
      setLastAction({ type: 'call', at: startedAt, phase: 'connected' })
      setIsBusy(false)
      actionTimerRef.current = null
    }, 1200)
  }

  const sendPing = () => {
    if (isBusy || !online) return
    setIsBusy(true)
    const startedAt = new Date()
    setLastAction({ type: 'ping', at: startedAt, phase: 'pending' })

    actionTimerRef.current = window.setTimeout(() => {
      setLastAction({
        type: 'ping',
        at: startedAt,
        phase: online ? 'delivered' : 'failed',
      })
      setIsBusy(false)
      actionTimerRef.current = null
    }, 1400)
  }

  const isCompact = variant === 'compact'

  return (
    <div className={isCompact ? 'space-y-2' : 'mt-4 space-y-3'}>
      <div className={`grid gap-2 sm:flex sm:flex-wrap ${isCompact ? '' : 'sm:gap-3'}`}>
        <a
          href={`tel:${phone.replace(/\D/g, '')}`}
          onClick={(event) => {
            event.preventDefault()
            startCall()
          }}
          className={`hex-btn-critical ${
            isCompact ? 'hex-btn-sm' : 'hex-btn-md w-full sm:w-auto'
          }`}
        >
          <Phone aria-hidden="true" size={isCompact ? 14 : 16} strokeWidth={1.75} />
          Call driver
        </a>
        <button
          type="button"
          onClick={sendPing}
          disabled={!online || isBusy}
          title={online ? undefined : 'Driver is offline — try calling instead'}
          className={`hex-btn-primary ${
            isCompact ? 'hex-btn-sm' : 'hex-btn-md w-full sm:w-auto'
          }`}
        >
          <BellRing aria-hidden="true" size={isCompact ? 14 : 16} strokeWidth={1.75} />
          Ping to stop driving
        </button>
      </div>

      {!isCompact && (
        <p className="text-xs leading-relaxed opacity-80">
          Ping sends an urgent in-cab alert: “{violationStopPingMessage}”
        </p>
      )}

      {lastAction && (
        <p
          role="status"
          className={`text-xs font-medium ${
            lastAction.phase === 'failed'
              ? 'text-risk-critical'
              : lastAction.phase === 'pending'
                ? 'text-hex-muted'
                : 'text-success-text'
          }`}
        >
          {statusMessage(lastAction, driverName, phone)}
        </p>
      )}

      {!online && !isCompact && (
        <p className="text-xs opacity-75">Driver app offline — ping unavailable. Call or radio dispatch.</p>
      )}
    </div>
  )
}
