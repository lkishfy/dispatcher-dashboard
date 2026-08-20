import { render } from '@testing-library/react'
import * as axeCore from 'axe-core'
import { describe, expect, it, vi } from 'vitest'
import { FleetFilters } from './FleetFilters'

describe('FleetFilters', () => {
  it('renders an accessible filter form', async () => {
    const { container } = render(
      <FleetFilters
        search=""
        status="all"
        severity="all"
        freshness="all"
        searchSuggestions={[]}
        onSearchChange={vi.fn()}
        onStatusChange={vi.fn()}
        onSeverityChange={vi.fn()}
        onFreshnessChange={vi.fn()}
      />,
    )

    expect((await axeCore.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    })).violations).toHaveLength(0)
  })
})
