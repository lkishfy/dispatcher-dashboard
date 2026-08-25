import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { simulateFleetRefresh } from '../domain/fleetSimulation'
import { buildDriverSummaries } from '../domain/hos'
import type { FleetData } from '../types/fleet'

const HOURLY_REFRESH_MS = 60 * 60 * 1000

export function useFleetSnapshot(initialFleet: FleetData) {
  const [fleetSnapshot, setFleetSnapshot] = useState<FleetData>(() => initialFleet)
  const [lastRefreshedAt, setLastRefreshedAt] = useState(
    () => new Date(initialFleet.snapshotTime),
  )
  const [isRefreshing, setIsRefreshing] = useState(false)
  const refreshTimerRef = useRef<number | null>(null)

  const refresh = useCallback(() => {
    if (refreshTimerRef.current !== null) {
      window.clearTimeout(refreshTimerRef.current)
    }
    setIsRefreshing(true)

    refreshTimerRef.current = window.setTimeout(() => {
      const refreshedAt = new Date()
      setLastRefreshedAt(refreshedAt)
      setFleetSnapshot((current) => (
        simulateFleetRefresh(current, refreshedAt.toISOString())
      ))
      setIsRefreshing(false)
      refreshTimerRef.current = null
    }, 500)
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(refresh, HOURLY_REFRESH_MS)

    return () => {
      window.clearInterval(intervalId)
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current)
      }
    }
  }, [refresh])

  const summaries = useMemo(
    () => buildDriverSummaries(fleetSnapshot),
    [fleetSnapshot],
  )

  return {
    summaries,
    lastRefreshedAt,
    isRefreshing,
    refresh,
  }
}
