import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
} from 'react'

type RegisterTypeDialogProps = {
  onClose: () => void
  onSelectUser: () => void
  onSelectMerchant: () => void
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const nodes = container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )
  return Array.from(nodes).filter(
    (element) => element.offsetParent !== null || element === document.activeElement,
  )
}

export function RegisterTypeDialog({
  onClose,
  onSelectUser,
  onSelectMerchant,
}: RegisterTypeDialogProps): ReactElement {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }

    const focusable = getFocusableElements(dialog)
    focusable[0]?.focus()

    function handleDocumentKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleDocumentKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

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

  return (
    <div className="register-type-dialog">
      <button
        type="button"
        className="register-type-dialog__backdrop"
        aria-label="Close registration options"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className="register-type-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={handleDialogKeyDown}
      >
        <header className="register-type-dialog__header">
          <h2 id={titleId} className="register-type-dialog__title">
            Create your PayLater account
          </h2>
          <p id={descriptionId} className="register-type-dialog__description">
            Choose the account type to continue.
          </p>
        </header>

        <div className="register-type-dialog__options">
          <button
            type="button"
            className="register-type-dialog__option"
            onClick={onSelectUser}
          >
            <span className="register-type-dialog__option-label">User</span>
            <span className="register-type-dialog__option-desc">
              For customer accounts
            </span>
          </button>

          <button
            type="button"
            className="register-type-dialog__option"
            onClick={onSelectMerchant}
          >
            <span className="register-type-dialog__option-label">Merchant</span>
            <span className="register-type-dialog__option-desc">
              For business accounts
            </span>
          </button>
        </div>

        <div className="register-type-dialog__actions">
          <button
            type="button"
            className="register-type-dialog__cancel"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
