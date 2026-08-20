import { useId, type ReactNode } from 'react'
import { AccessibleDialog } from './AccessibleDialog'

interface ConfirmDialogProps {
  title: ReactNode
  description: ReactNode
  confirmLabel: string
  onConfirm: () => void
  onClose: () => void
  children?: ReactNode
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
  children,
}: ConfirmDialogProps) {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <AccessibleDialog
      labelledBy={titleId}
      describedBy={descriptionId}
      onClose={onClose}
      className="z-50"
    >
      <div className="grid h-full place-items-center p-4">
        <section className="w-full max-w-md rounded-dialog bg-white shadow-dialog">
          <header className="border-b border-hex-border px-5 py-4">
            <h2 id={titleId} className="font-semibold text-hex-ink">
              {title}
            </h2>
            <p id={descriptionId} className="mt-1 text-sm text-hex-muted">
              {description}
            </p>
          </header>
          {children}
          <footer className={`flex justify-end gap-2 px-5 py-4 ${children ? 'border-t border-hex-border' : ''}`}>
            <button type="button" onClick={onClose} className="hex-btn-secondary hex-btn-md">
              Cancel
            </button>
            <button type="button" onClick={onConfirm} className="hex-btn-primary hex-btn-md">
              {confirmLabel}
            </button>
          </footer>
        </section>
      </div>
    </AccessibleDialog>
  )
}
