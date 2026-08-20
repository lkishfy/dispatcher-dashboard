import {
  useCallback,
  useEffect,
  useRef,
  type MouseEvent,
  type ReactNode,
} from 'react'

interface AccessibleDialogProps {
  children: ReactNode
  labelledBy: string
  describedBy?: string
  onClose: () => void
  className?: string
}

export function AccessibleDialog({
  children,
  labelledBy,
  describedBy,
  onClose,
  className = '',
}: AccessibleDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  const setDialogRef = useCallback((dialog: HTMLDialogElement | null) => {
    if (dialog && triggerRef.current === null) {
      triggerRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    }
    dialogRef.current = dialog
  }, [])

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()

    const handleCancel = (event: Event) => {
      event.preventDefault()
      onCloseRef.current()
    }
    dialog.addEventListener('cancel', handleCancel)

    return () => {
      dialog.removeEventListener('cancel', handleCancel)
      if (dialog.open) dialog.close()
      document.body.style.overflow = previousOverflow
      triggerRef.current?.focus()
    }
  }, [])

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <dialog
      ref={setDialogRef}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={handleBackdropClick}
      className={`m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-hex-overlay backdrop:backdrop-blur-[2px] ${className}`}
    >
      {children}
    </dialog>
  )
}
