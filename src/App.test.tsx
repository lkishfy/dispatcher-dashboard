import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as axeCore from 'axe-core'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('assembled dashboard', () => {
  it('opens and hides the persistent alerts sidebar from the navigation bar', async () => {
    const user = userEvent.setup()
    render(<App />)

    const sidebarPanel = document.getElementById('alerts-sidebar-panel')
    expect(sidebarPanel).toHaveAttribute('aria-hidden', 'true')

    await user.click(screen.getByRole('button', { name: /Open alerts sidebar/ }))
    expect(sidebarPanel).toHaveAttribute('aria-hidden', 'false')
    expect(screen.getByRole('heading', { name: 'Alerts' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Hide alerts' }))
    expect(sidebarPanel).toHaveAttribute('aria-hidden', 'true')
  })

  it('opens alert-originated driver details inside the alerts sidebar', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Open alerts sidebar/ }))
    const sidebarPanel = document.getElementById('alerts-sidebar-panel')
    if (!sidebarPanel) throw new Error('Alerts sidebar panel not found')
    await user.click(within(sidebarPanel).getByRole('button', { name: 'Alex Rivera' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Alex Rivera' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close details' }))
    expect(screen.getByRole('heading', { name: 'Alerts' })).toBeInTheDocument()
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<App />)

    const results = await axeCore.run(container, {
      rules: {
        'color-contrast': { enabled: false },
      },
    })

    expect(results.violations).toHaveLength(0)
  })
})
