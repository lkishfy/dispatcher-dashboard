import type { MouseEvent } from 'react'

interface SelectionCheckboxProps {
  label: string
  checked: boolean
  indeterminate?: boolean
  disabled?: boolean
  visibleLabel?: string
  onChange: () => void
  onClick?: (event: MouseEvent<HTMLInputElement>) => void
}

export function SelectionCheckbox({
  label,
  checked,
  indeterminate = false,
  disabled = false,
  visibleLabel,
  onChange,
  onClick,
}: SelectionCheckboxProps) {
  return (
    <label className={visibleLabel
      ? 'inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-hex-border bg-white px-3 text-xs text-hex-ink hover:bg-hex-bg'
      : 'grid size-10 cursor-pointer place-items-center'}
    >
      <span className={visibleLabel ? '' : 'sr-only'}>{visibleLabel ?? label}</span>
      <input
        type="checkbox"
        aria-label={label}
        checked={checked}
        disabled={disabled}
        ref={(input) => {
          if (input) input.indeterminate = indeterminate
        }}
        onClick={onClick}
        onChange={onChange}
        className={`size-4 accent-hex-ink disabled:opacity-30 ${visibleLabel ? 'order-first' : ''}`}
      />
    </label>
  )
}
