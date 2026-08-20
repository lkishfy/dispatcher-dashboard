import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { DriverSummary } from '../../domain/hos'
import { createDriverSummary } from '../../test/factories'
import { NotificationCenter } from './NotificationCenter'

function createViolation(id = 'a', name = 'Alex Rivera'): DriverSummary {
  return {
    ...createDriverSummary(id, name, -12),
    severity: 'violation',
    driveMinutesRemaining: -12,
  }
}

describe('NotificationCenter', () => {
  it('presents prioritized alerts with category filters', async () => {
    const user = userEvent.setup()
    render(
      <NotificationCenter
        violations={[createViolation()]}
        hosAlerts={[createDriverSummary('b', 'Bea Stone', 20)]}
        verificationDrivers={[createDriverSummary('c', 'Chris Lee', 180, true)]}
        onDismissViolation={vi.fn()}
        onDismissVerification={vi.fn()}
        onOpenDriver={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Alerts' })).toBeInTheDocument()
    expect(screen.getByText('Violation')).toBeInTheDocument()
    expect(screen.getByText('HOS alert')).toBeInTheDocument()
    expect(screen.getByText('Needs verification')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'HOS 1' }))
    expect(screen.getByText('HOS alert')).toBeInTheDocument()
    expect(screen.queryByText('Violation')).not.toBeInTheDocument()
    expect(screen.queryByText('Needs verification')).not.toBeInTheDocument()
  })

  it('supports HOS drill-in, calling, and reassignment', async () => {
    const user = userEvent.setup()
    const onOpenDriver = vi.fn()
    render(
      <NotificationCenter
        violations={[]}
        hosAlerts={[createDriverSummary('a', 'Alex Rivera', 20)]}
        verificationDrivers={[]}
        onDismissViolation={vi.fn()}
        onDismissVerification={vi.fn()}
        onOpenDriver={onOpenDriver}
      />,
    )

    expect(screen.getByText(/Reset due at limit/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Alex Rivera' }))
    expect(onOpenDriver).toHaveBeenCalledWith('a')
    expect(screen.getByRole('link', { name: 'Call Alex Rivera' }))
      .toHaveAttribute('href', 'tel:3125551001')
    await user.click(screen.getByRole('button', { name: 'Reassign' }))
    expect(onOpenDriver).toHaveBeenCalledTimes(2)
    expect(onOpenDriver).toHaveBeenLastCalledWith('a')
  })

  it('confirms before dismissing a violation', async () => {
    const user = userEvent.setup()
    const onDismissViolation = vi.fn()
    render(
      <NotificationCenter
        violations={[createViolation()]}
        hosAlerts={[]}
        verificationDrivers={[]}
        onDismissViolation={onDismissViolation}
        onDismissVerification={vi.fn()}
        onOpenDriver={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', {
      name: 'Dismiss violation for Alex Rivera',
    }))
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Dismiss this violation?')
    await user.click(screen.getByRole('button', { name: 'Confirm dismissal' }))

    expect(onDismissViolation).toHaveBeenCalledWith('a')
  })

  it('dismisses verification alerts and progressively reveals long queues', async () => {
    const user = userEvent.setup()
    const onDismissVerification = vi.fn()
    const verificationDrivers = Array.from({ length: 7 }, (_, index) => (
      createDriverSummary(`${index}`, `Driver ${index}`, 180, true)
    ))
    render(
      <NotificationCenter
        violations={[]}
        hosAlerts={[]}
        verificationDrivers={verificationDrivers}
        onDismissViolation={vi.fn()}
        onDismissVerification={onDismissVerification}
        onOpenDriver={vi.fn()}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Driver 6' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Show 1 more alert' }))
    expect(screen.getByRole('button', { name: 'Driver 6' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', {
      name: 'Dismiss needs verification for Driver 0',
    }))
    expect(onDismissVerification).toHaveBeenCalledWith('0')
  })
})
