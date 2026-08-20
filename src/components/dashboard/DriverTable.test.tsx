import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createDriverSummary } from '../../test/factories'
import { DriverTable } from './DriverTable'

describe('DriverTable', () => {
  it('shows violation and HOS alert badges in both responsive table views', () => {
    render(
      <DriverTable
        summaries={[
          createDriverSummary('a', 'Alex Rivera', -12),
          createDriverSummary('b', 'Bea Stone', 60),
        ]}
        selectedIds={new Set()}
        lockedDriverIds={new Set()}
        onToggleSelect={vi.fn()}
        onSetSelection={vi.fn()}
        onOpenDriver={vi.fn()}
      />,
    )

    expect(screen.getAllByText('Violation')).toHaveLength(2)
    expect(screen.getAllByText('HOS alert')).toHaveLength(2)
  })

  it('shares nudge state across mobile and desktop representations', async () => {
    const user = userEvent.setup()
    render(
      <DriverTable
        summaries={[createDriverSummary('a', 'Alex Rivera', 20)]}
        selectedIds={new Set()}
        lockedDriverIds={new Set()}
        onToggleSelect={vi.fn()}
        onSetSelection={vi.fn()}
        onOpenDriver={vi.fn()}
      />,
    )

    const nudgeButtons = screen.getAllByRole('button', { name: 'Nudge' })
    expect(nudgeButtons).toHaveLength(2)
    await user.click(nudgeButtons[0])

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Send nudge to Alex Rivera?')
    expect(screen.getByText(/projected to exceed available HOS/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Send nudge' }))

    const nudgedButtons = screen.getAllByRole('button', { name: 'Nudged' })
    expect(nudgedButtons).toHaveLength(2)
    nudgedButtons.forEach((button) => expect(button).toBeDisabled())
  })

  it('selects every visible eligible load in batch mode', async () => {
    const user = userEvent.setup()
    const onSetSelection = vi.fn()
    render(
      <DriverTable
        summaries={[
          createDriverSummary('a', 'Alex Rivera', 20),
          createDriverSummary('b', 'Bea Stone', 60, true),
        ]}
        selectedIds={new Set()}
        lockedDriverIds={new Set()}
        onToggleSelect={vi.fn()}
        onSetSelection={onSetSelection}
        onOpenDriver={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('checkbox', {
      name: 'Select all visible loads for batch reassignment',
    }))

    expect(onSetSelection).toHaveBeenCalledTimes(1)
    expect(onSetSelection).toHaveBeenCalledWith(['a'], true)
  })
})
