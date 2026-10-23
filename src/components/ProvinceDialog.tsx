import { useEffect, useRef } from 'react'
import type { Destination } from '../data/provinces'
import { groupByUniversity } from '../lib/school-groups'
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

          <div className="province-dialog__list">
            <div className="province-dialog__groups">
              {groupByUniversity(destination.students).map((group) => (
                <section
                  className="province-dialog__group"
                  key={group.university}
                  aria-label={`${group.university}，${group.students.length} 人`}
                >
                  <h3>{group.university}</h3>
                  <p>
                    {group.students.map((student) => (
                      <span key={student.name}>{student.name}</span>
                    ))}
                  </p>
                </section>
              ))}
            </div>
          </div>

          <footer className="province-dialog__foot">
            <p>山高水长，后会有期。</p>
            <Seal chars="后会有期" className="seal--dialog" />
          </footer>
        </div>
      )}
    </dialog>
  )
}
