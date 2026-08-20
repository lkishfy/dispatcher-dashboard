import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { HexSearchInput } from './HexSearchInput'
import { HexSelect } from './HexSelect'

describe('accessible dashboard inputs', () => {
  it('supports search typeahead navigation and selection', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <HexSearchInput
        value="al"
        onChange={onChange}
        placeholder="Search"
        ariaLabel="Search drivers"
        suggestions={['Alex Rivera', 'Alice Wong', 'Bea Stone']}
      />,
    )

    const input = screen.getByRole('combobox', { name: 'Search drivers' })
    await user.click(input)
    await user.keyboard('{ArrowDown}{End}{Enter}')

    expect(onChange).toHaveBeenLastCalledWith('Alice Wong')
  })

  it('supports select keyboard navigation and selection', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [value, setValue] = useState('one')
      return (
        <HexSelect
          value={value}
          options={[
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two' },
          ]}
          onChange={setValue}
          ariaLabel="Choose number"
        />
      )
    }

    render(<Harness />)
    const select = screen.getByRole('button', { name: 'Choose number' })
    await user.click(select)
    await user.keyboard('{End}{Enter}')

    expect(select).toHaveTextContent('Two')
    expect(select).toHaveAttribute('aria-expanded', 'false')
  })
})
