import { useCallback, useReducer } from 'react'

interface WorkflowState {
  selected: Set<string>
  staged: Record<string, string>
  confirmed: Record<string, string>
}

type WorkflowAction =
  | { type: 'toggle'; driverId: string }
  | { type: 'stage'; fromDriverId: string; toDriverId: string }
  | { type: 'stage-batch'; assignments: Record<string, string> }
  | { type: 'confirm'; fromDriverId: string }
  | { type: 'undo'; fromDriverId: string }

const initialState: WorkflowState = {
  selected: new Set(),
  staged: {},
  confirmed: {},
}

function validAssignments(assignments: Record<string, string>) {
  const result: Record<string, string> = {}
  const used = new Set<string>()
  for (const [from, to] of Object.entries(assignments)) {
    if (!from || !to || from === to || used.has(to)) continue
    result[from] = to
    used.add(to)
  }
  return result
}

export function reassignmentReducer(
  state: WorkflowState,
  action: WorkflowAction,
): WorkflowState {
  if (action.type === 'toggle') {
    if (state.staged[action.driverId] || state.confirmed[action.driverId]) return state
    const selected = new Set(state.selected)
    if (selected.has(action.driverId)) selected.delete(action.driverId)
    else selected.add(action.driverId)
    return { ...state, selected }
  }
  if (action.type === 'stage' || action.type === 'stage-batch') {
    const assignments = validAssignments(action.type === 'stage'
      ? { [action.fromDriverId]: action.toDriverId }
      : action.assignments)
    const selected = new Set(state.selected)
    const confirmed = { ...state.confirmed }
    for (const sourceId of Object.keys(assignments)) {
      selected.delete(sourceId)
      delete confirmed[sourceId]
    }
    return {
      selected,
      staged: { ...state.staged, ...assignments },
      confirmed,
    }
  }
  if (action.type === 'confirm') {
    const replacementId = state.staged[action.fromDriverId]
    if (!replacementId) return state
    const staged = { ...state.staged }
    delete staged[action.fromDriverId]
    return {
      ...state,
      staged,
      confirmed: { ...state.confirmed, [action.fromDriverId]: replacementId },
    }
  }
  if (action.type === 'undo') {
    const staged = { ...state.staged }
    const confirmed = { ...state.confirmed }
    delete staged[action.fromDriverId]
    delete confirmed[action.fromDriverId]
    return { ...state, staged, confirmed }
  }

  return state
}

export function useReassignmentWorkflow() {
  const [state, dispatch] = useReducer(reassignmentReducer, initialState)
  const toggleSelection = useCallback((driverId: string) => {
    dispatch({ type: 'toggle', driverId })
  }, [])
  const stage = useCallback((fromDriverId: string, toDriverId: string) => {
    dispatch({ type: 'stage', fromDriverId, toDriverId })
  }, [])
  const stageBatch = useCallback((assignments: Record<string, string>) => {
    dispatch({ type: 'stage-batch', assignments })
  }, [])
  const confirm = useCallback((fromDriverId: string) => {
    dispatch({ type: 'confirm', fromDriverId })
  }, [])
  const undo = useCallback((fromDriverId: string) => {
    dispatch({ type: 'undo', fromDriverId })
  }, [])

  return {
    ...state,
    toggleSelection,
    stage,
    stageBatch,
    confirm,
    undo,
  }
}
