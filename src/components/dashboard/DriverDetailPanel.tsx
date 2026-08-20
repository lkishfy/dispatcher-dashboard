import { AccessibleDialog } from '../ui/AccessibleDialog'
import {
  DriverDetailContent,
  type DriverDetailContentProps,
} from './DriverDetailContent'

export function DriverDetailPanel(props: DriverDetailContentProps) {
  return (
    <AccessibleDialog
      labelledBy="driver-detail-title"
      describedBy="driver-detail-description"
      onClose={props.onClose}
      className="z-50"
    >
      <div className="flex h-full justify-end">
        <aside className="relative h-full w-full max-w-2xl overflow-y-auto bg-hex-bg shadow-dialog">
          <DriverDetailContent {...props} />
        </aside>
      </div>
    </AccessibleDialog>
  )
}
