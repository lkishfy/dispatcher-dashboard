import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as axeCore from 'axe-core'
import { describe, expect, it, vi } from 'vitest'
import { createDriverSummary } from '../../test/factories'
import { BatchReassignModal } from './BatchReassignModal'

function DialogHarness() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open batch</button>
      {open && (
        <BatchReassignModal
          selectedSummaries={[createDriverSummary('a', 'Alex Rivera', 20)]}
          availableDrivers={[createDriverSummary('b', 'Bea Stone', 300, true)]}
          onConfirm={vi.fn()}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

describe('AccessibleDialog', () => {
  it('ignores a stale native close event after opening', async () => {
    const user = userEvent.setup()
    render(<DialogHarness />)

    await user.click(screen.getByRole('button', { name: 'Open batch' }))
    screen.getByRole('dialog').dispatchEvent(new Event('close'))

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Reassign')
  })

  it('closes through native cancel, restores focus, and has no axe violations', async () => {
    const user = userEvent.setup()
    const { container } = render(<DialogHarness />)
    const trigger = screen.getByRole('button', { name: 'Open batch' })
    await user.click(trigger)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAccessibleName('Reassign')
    expect(document.body.style.overflow).toBe('hidden')
    expect((await axeCore.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    })).violations).toHaveLength(0)

    fireEvent(dialog, new Event('cancel', { cancelable: true }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(document.body.style.overflow).toBe('')
  })
})
