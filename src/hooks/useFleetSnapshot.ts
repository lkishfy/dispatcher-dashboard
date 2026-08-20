import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { simulateFleetRefresh } from '../domain/fleetSimulation'
import { buildDriverSummaries } from '../domain/hos'
import type { FleetData } from '../types/fleet'

export function useFleetSnapshot(initialFleet: FleetData) {
  const [fleetSnapshot, setFleetSnapshot] = useState<FleetData>(() => initialFleet)
  const [lastRefreshedAt, setLastRefreshedAt] = useState(
    () => new Date(initialFleet.snapshotTime),
  )
  const [isRefreshing, setIsRefreshing] = useState(false)
  const refreshTimerRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (refreshTimerRef.current !== null) {
      window.clearTimeout(refreshTimerRef.current)
    }
  }, [])

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

  const summaries = useMemo(
    () => buildDriverSummaries(fleetSnapshot),
    [fleetSnapshot],
  )

  return {
    fleetSnapshot,
    summaries,
    lastRefreshedAt,
    isRefreshing,
    refresh,
  }
}
