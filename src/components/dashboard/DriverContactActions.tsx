import { BellRing, Phone } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { formatCdtRefreshTime } from '../../utils/formatCdtTime'
import {
  getDriverPhone,
  getDriverTelHref,
  violationStopPingMessage,
  type ContactActionStatus,
} from '../../utils/driverContact'

interface DriverContactActionsProps {
  driverId: string
  driverName: string
  online: boolean
}

function statusMessage(action: ContactActionStatus, driverName: string, phone: string): string {
  const time = formatCdtRefreshTime(action.at)

  if (action.type === 'call') {
    if (action.phase === 'pending') return `Calling ${phone}…`
    return `Connected to ${driverName} · ${time}`
  }

  if (action.phase === 'pending') return `Sending in-cab alert to ${driverName}…`
  return `In-cab alert delivered · ${time}`
}

export function DriverContactActions({
  driverId,
  driverName,
  online,
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
        phase: 'delivered',
      })
      setIsBusy(false)
      actionTimerRef.current = null
    }, 1400)
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
        <a
          href={getDriverTelHref(driverId)}
          onClick={(event) => {
            event.preventDefault()
            startCall()
          }}
          className="hex-btn-critical hex-btn-md w-full sm:w-auto"
        >
          <Phone aria-hidden="true" size={16} strokeWidth={1.75} />
          Call driver
        </a>
        <button
          type="button"
          onClick={sendPing}
          disabled={!online || isBusy}
          title={online ? undefined : 'Driver is offline — try calling instead'}
          className="hex-btn-primary hex-btn-md w-full sm:w-auto"
        >
          <BellRing aria-hidden="true" size={16} strokeWidth={1.75} />
          Ping to stop driving
        </button>
      </div>

      <p className="text-xs leading-relaxed opacity-80">
        Ping sends an urgent in-cab alert: “{violationStopPingMessage}”
      </p>

      {lastAction && (
        <p
          role="status"
          className={`text-xs font-medium ${
            lastAction.phase === 'pending'
              ? 'text-hex-muted'
              : 'text-success-text'
          }`}
        >
          {statusMessage(lastAction, driverName, phone)}
        </p>
      )}

      {!online && (
        <p className="text-xs opacity-75">Driver app offline — ping unavailable. Call or radio dispatch.</p>
      )}
    </div>
  )
}
