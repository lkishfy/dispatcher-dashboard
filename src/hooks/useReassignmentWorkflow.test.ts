import { describe, expect, it } from 'vitest'
import { reassignmentReducer } from './useReassignmentWorkflow'

describe('reassignment workflow reducer', () => {
  it('moves selected loads through staged, confirmed, and undo states', () => {
    const selected = reassignmentReducer(
      { selected: new Set(), staged: {}, confirmed: {} },
      { type: 'toggle', driverId: 'source' },
    )
    const staged = reassignmentReducer(selected, {
      type: 'stage-batch',
      assignments: { source: 'replacement' },
    })
    expect(staged.selected.size).toBe(0)
    expect(staged.staged).toEqual({ source: 'replacement' })

    const undone = reassignmentReducer(staged, { type: 'undo', fromDriverId: 'source' })
    expect(undone.staged).toEqual({})

    const restaged = reassignmentReducer(undone, {
      type: 'stage',
      fromDriverId: 'source',
      toDriverId: 'replacement',
    })
    const confirmed = reassignmentReducer(restaged, { type: 'confirm', fromDriverId: 'source' })
    expect(confirmed.staged).toEqual({})
    expect(confirmed.confirmed).toEqual({ source: 'replacement' })

    const reverted = reassignmentReducer(confirmed, { type: 'undo', fromDriverId: 'source' })
    expect(reverted.confirmed).toEqual({})
  })

  it('rejects self-assignment and duplicate replacements', () => {
    const next = reassignmentReducer(
      { selected: new Set(['a', 'b']), staged: {}, confirmed: {} },
      { type: 'stage-batch', assignments: { a: 'a', b: 'replacement', c: 'replacement' } },
    )
    expect(next.staged).toEqual({ b: 'replacement' })
    expect(next.selected).toEqual(new Set(['a']))
  })

  it('updates a visible selection in one reducer transition', () => {
    const selected = reassignmentReducer(
      { selected: new Set(['existing']), staged: {}, confirmed: {} },
      { type: 'set-selection', driverIds: ['a', 'b'], selected: true },
    )
    expect(selected.selected).toEqual(new Set(['existing', 'a', 'b']))

    const cleared = reassignmentReducer(
      selected,
      { type: 'set-selection', driverIds: ['a', 'b'], selected: false },
    )
    expect(cleared.selected).toEqual(new Set(['existing']))
  })

  it('confirms batch assignments directly from the modal flow', () => {
    const confirmed = reassignmentReducer(
      {
        selected: new Set(['a', 'b']),
        staged: { a: 'old-replacement' },
        confirmed: {},
      },
      {
        type: 'confirm-batch',
        assignments: { a: 'replacement-a', b: 'replacement-b' },
      },
    )

    expect(confirmed.selected).toEqual(new Set())
    expect(confirmed.staged).toEqual({})
    expect(confirmed.confirmed).toEqual({
      a: 'replacement-a',
      b: 'replacement-b',
    })
  })
})
