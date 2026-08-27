import {
  useEffect,
  useId,
  useRef,
  type FormEventHandler,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

type AdminModalProps = {
  title: ReactNode
  onClose: () => void
  closeLabel?: string
  children: ReactNode
  onSubmit?: FormEventHandler<HTMLFormElement>
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const nodes = container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )
  return Array.from(nodes).filter(
    (element) => element.offsetParent !== null || element === document.activeElement,
  )
}

export function AdminModal({
  title,
  onClose,
  closeLabel = 'Close dialog',
  children,
  onSubmit,
}: AdminModalProps): ReactElement {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }

    const previouslyFocused = document.activeElement as HTMLElement | null
    const focusable = getFocusableElements(dialog)
    focusable[0]?.focus()

    function handleDocumentKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
      }
    }

    document.addEventListener('keydown', handleDocumentKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [])

  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLDivElement>): void {
    if (event.key !== 'Tab' || !dialogRef.current) {
      return
    }

    const focusable = getFocusableElements(dialogRef.current)
    if (focusable.length === 0) {
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) {
      return
    }

    const active = document.activeElement

    if (event.shiftKey && active === first) {
      event.preventDefault()
      last.focus()
      return
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const header = (
    <header className="admin-modal-header">
      <h2 id={titleId} className="admin-modal-title">
        {title}
      </h2>
      <button
        type="button"
        className="admin-modal-close"
        aria-label={closeLabel}
        onClick={onClose}
      >
        &times;
      </button>
    </header>
  )

  const inner = onSubmit ? (
    <form onSubmit={onSubmit}>
      {header}
      {children}
    </form>
  ) : (
    <>
      {header}
      {children}
    </>
  )

  return (
    <div className="admin-modal-backdrop">
      <div
        ref={dialogRef}
        className="admin-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleDialogKeyDown}
      >
        {inner}
      </div>
    </div>
  )
}