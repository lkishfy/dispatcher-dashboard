import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import fleetJson from '../data/fleet.json'
import { parseFleetData } from '../domain/parseFleetData'
import { useFleetSnapshot } from './useFleetSnapshot'

const fleet = parseFleetData(fleetJson)

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useFleetSnapshot', () => {
  it('replaces a pending refresh timer and cleans it up on unmount', () => {
    vi.useFakeTimers()
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
    const { result, unmount } = renderHook(() => useFleetSnapshot(fleet))

    act(() => {
      result.current.refresh()
      result.current.refresh()
    })

    expect(result.current.isRefreshing).toBe(true)
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1)

    unmount()
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(2)

    act(() => {
      vi.runAllTimers()
    })
  })

  it('publishes refreshed summaries when the timer completes', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useFleetSnapshot(fleet))
    const initialRefreshTime = result.current.lastRefreshedAt

    act(() => {
      result.current.refresh()
      vi.advanceTimersByTime(500)
    })

    expect(result.current.isRefreshing).toBe(false)
    expect(result.current.lastRefreshedAt).not.toBe(initialRefreshTime)
    expect(result.current.summaries).toHaveLength(fleet.drivers.length)
  })
})
