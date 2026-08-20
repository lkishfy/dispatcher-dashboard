import { useEffect, useRef, type RefObject } from 'react'

export function useDismissOnOutsideClick(
  containerRef: RefObject<HTMLElement | null>,
  isActive: boolean,
  onDismiss: () => void,
) {
  const onDismissRef = useRef(onDismiss)

  useEffect(() => {
    onDismissRef.current = onDismiss
  }, [onDismiss])

  useEffect(() => {
    if (!isActive) return

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return
      onDismissRef.current()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [containerRef, isActive])
}
