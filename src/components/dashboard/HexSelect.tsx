import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'

interface HexSelectOption<T extends string = string> {
  value: T
  label: string
}

interface HexSelectProps<T extends string> {
  value: T
  options: HexSelectOption<T>[]
  onChange: (value: T) => void
  ariaLabel: string
  className?: string
}

export function HexSelect<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className = '',
}: HexSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listboxId = useId()
  const selected = options.find((option) => option.value === value) ?? options[0]
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value))

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return
      setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [open])

  const selectOption = (nextValue: T) => {
    onChange(nextValue)
    setOpen(false)
    setActiveIndex(-1)
    triggerRef.current?.focus()
  }

  const openAt = (index: number) => {
    setOpen(true)
    setActiveIndex(index)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') {
      if (open) event.preventDefault()
      setOpen(false)
      setActiveIndex(-1)
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (open && activeIndex >= 0) selectOption(options[activeIndex].value)
      else openAt(selectedIndex)
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const delta = event.key === 'ArrowDown' ? 1 : -1
      const start = open ? activeIndex : selectedIndex
      openAt(Math.max(0, Math.min(options.length - 1, start + delta)))
      return
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      openAt(event.key === 'Home' ? 0 : options.length - 1)
    }
  }

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.relatedTarget && containerRef.current?.contains(event.relatedTarget as Node)) return
    setOpen(false)
    setActiveIndex(-1)
  }

  return (
    <div ref={containerRef} onBlur={handleBlur} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        onClick={() => {
          if (open) {
            setOpen(false)
            setActiveIndex(-1)
          } else {
            openAt(selectedIndex)
          }
        }}
        onKeyDown={handleKeyDown}
        className="hex-select flex w-full min-w-[9.5rem] items-center justify-between gap-2 text-left"
      >
        <span className="truncate">{selected.label}</span>
        <ChevronDown
          aria-hidden="true"
          size={16}
          strokeWidth={1.75}
          className={`shrink-0 text-hex-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute top-[calc(100%+0.25rem)] z-20 max-h-64 min-w-full overflow-auto rounded-popover border border-hex-border bg-white py-1 shadow-popover"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value
            const isActive = index === activeIndex

            return (
              <li
                key={option.value}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                onPointerMove={() => setActiveIndex(index)}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option.value)}
                className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm transition ${
                  isActive ? 'bg-hex-bg' : 'hover:bg-hex-bg'
                } ${isSelected ? 'font-medium text-hex-ink' : 'text-hex-ink/90'}`}
              >
                  <Check
                    aria-hidden="true"
                    size={14}
                    strokeWidth={2}
                    className={`shrink-0 ${isSelected ? 'text-hex-ink' : 'opacity-0'}`}
                  />
                  <span>{option.label}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
