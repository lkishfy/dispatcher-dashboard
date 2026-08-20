import { Search } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, type FocusEvent } from 'react'

interface HexSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  ariaLabel: string
  suggestions?: string[]
  className?: string
}

export function HexSearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  suggestions = [],
  className = '',
}: HexSearchInputProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputId = useId()
  const listboxId = useId()
  const normalizedValue = value.trim().toLowerCase()

  const matches = useMemo(() => {
    if (!normalizedValue) return []

    return [...new Set(suggestions)]
      .filter((suggestion) => suggestion.toLowerCase().includes(normalizedValue))
      .toSorted((first, second) => {
        const firstStarts = first.toLowerCase().startsWith(normalizedValue)
        const secondStarts = second.toLowerCase().startsWith(normalizedValue)
        if (firstStarts !== secondStarts) return firstStarts ? -1 : 1
        return first.localeCompare(second)
      })
      .slice(0, 6)
  }, [normalizedValue, suggestions])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return
      setOpen(false)
      setActiveIndex(-1)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  const selectSuggestion = (suggestion: string) => {
    onChange(suggestion)
    setOpen(false)
    setActiveIndex(-1)
  }

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.relatedTarget && containerRef.current?.contains(event.relatedTarget as Node)) return
    setOpen(false)
    setActiveIndex(-1)
  }

  return (
    <div ref={containerRef} onBlur={handleBlur} className={`relative block min-w-0 ${className}`}>
      <label htmlFor={inputId} className="sr-only">{ariaLabel}</label>
      <Search
        aria-hidden="true"
        size={16}
        className="pointer-events-none absolute top-3 left-3 text-hex-muted"
        strokeWidth={1.75}
      />
      <input
        id={inputId}
        type="search"
        value={value}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && matches.length > 0}
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
        autoComplete="off"
        onFocus={() => setOpen(matches.length > 0)}
        onChange={(event) => {
          onChange(event.target.value)
          setOpen(true)
          setActiveIndex(-1)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && matches.length > 0) {
            event.preventDefault()
            setOpen(true)
            setActiveIndex((current) => Math.min(current + 1, matches.length - 1))
          } else if (event.key === 'ArrowUp' && matches.length > 0) {
            event.preventDefault()
            setOpen(true)
            setActiveIndex((current) => current <= 0 ? matches.length - 1 : current - 1)
          } else if (event.key === 'Home' && open && matches.length > 0) {
            event.preventDefault()
            setActiveIndex(0)
          } else if (event.key === 'End' && open && matches.length > 0) {
            event.preventDefault()
            setActiveIndex(matches.length - 1)
          } else if (event.key === 'Enter' && open && activeIndex >= 0) {
            event.preventDefault()
            selectSuggestion(matches[activeIndex])
          } else if (event.key === 'Escape') {
            setOpen(false)
            setActiveIndex(-1)
          }
        }}
        placeholder={placeholder}
        className="hex-input h-10 w-full pr-3 pl-9 placeholder:text-hex-muted"
      />

      {open && matches.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={`${ariaLabel} suggestions`}
          className="absolute top-[calc(100%+0.25rem)] z-40 max-h-64 w-full overflow-auto rounded-popover border border-hex-border bg-white py-1 shadow-popover"
        >
          {matches.map((suggestion, index) => (
            <li
              key={suggestion}
              id={`${listboxId}-${index}`}
              role="option"
              aria-selected={activeIndex === index}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => selectSuggestion(suggestion)}
              onPointerMove={() => setActiveIndex(index)}
              className={`cursor-pointer truncate px-3 py-2 text-left text-sm ${
                activeIndex === index
                  ? 'bg-hex-bg text-hex-ink'
                  : 'text-hex-ink/90 hover:bg-hex-bg'
              }`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
