import { useEffect, useRef, type CSSProperties } from 'react'
import type { Destination } from '../data/provinces'
import { Seal } from './Seal'

type ProvinceDialogProps = {
  destination: Destination | null
  onClose: () => void
}

export function ProvinceDialog({ destination, onClose }: ProvinceDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (destination && !dialog.open) dialog.showModal()
  }, [destination])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  const close = () => dialogRef.current?.close()

  return (
    <dialog
      ref={dialogRef}
      className="province-dialog"
      aria-labelledby={destination ? 'province-dialog-title' : undefined}
      data-region={destination?.region}
      onClick={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      {destination && (
        <div className="province-dialog__panel">
          <button
            type="button"
            className="province-dialog__close"
            onClick={close}
            aria-label="关闭名册"
            autoFocus
          >
            <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
              <path
                d="M3 3l10 10M13 3L3 13"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <header className="province-dialog__head">
            <p className="eyebrow">
              {destination.region} · Where they go
            </p>
            <h2 id="province-dialog-title">{destination.province}</h2>
            <p className="province-dialog__count">
              <span>{String(destination.students.length).padStart(2, '0')}</span>
              位同窗
            </p>
            <span className="province-dialog__ghost" aria-hidden="true">
              {destination.province.slice(0, 1)}
            </span>
          </header>

          <ol className="province-dialog__list">
            {destination.students.map((student, index) => (
              <li key={`${student.name}-${index}`} style={{ '--i': index } as CSSProperties}>
                <span className="province-dialog__index">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="province-dialog__name">{student.name}</span>
                <span className="province-dialog__school">{student.university}</span>
              </li>
            ))}
          </ol>

          <footer className="province-dialog__foot">
            <p>山高水长，后会有期。</p>
            <Seal chars="后会有期" className="seal--dialog" />
          </footer>
        </div>
      )}
    </dialog>
  )
}
