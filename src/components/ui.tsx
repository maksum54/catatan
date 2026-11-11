import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Ban, Check, CheckCircle2, Circle, CircleAlert, CircleDashed, CircleDot, SignalHigh, SignalLow, SignalMedium, X, XCircle } from 'lucide-react'
import { PRIORITIES, PRIORITY_COLOR, STATES, STATE_COLOR } from '../lib'
import { useT } from '../i18n'
import type { PriorityKey, StateKey } from '../types'

/** Menu popover yang diposisikan terhadap pemicunya dan dijaga tetap di dalam layar. */
export function Menu({ trigger, children, className = '', width = 208 }: {
  trigger: ReactNode; children: ReactNode | ((close: () => void) => ReactNode); className?: string; width?: number
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btn = useRef<HTMLSpanElement>(null)
  const pop = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!open || !btn.current) return
    const r = btn.current.getBoundingClientRect()
    const h = pop.current?.offsetHeight ?? 0
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8))
    const top = r.bottom + 4 + h > window.innerHeight - 8 ? Math.max(8, r.top - h - 4) : r.bottom + 4
    setPos({ top, left })
  }, [open, width])
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!pop.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])
  return (
    <>
      <span ref={btn} className={`inline-flex ${className}`} onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}>
        {trigger}
      </span>
      {open &&
        createPortal(
          <div ref={pop} style={{ top: pos.top, left: pos.left, width }} onClick={(e) => e.stopPropagation()}
            className="fixed z-50 max-h-[60vh] overflow-auto rounded-lg border border-line bg-raised p-1 shadow-xl">
            {typeof children === 'function' ? children(() => setOpen(false)) : children}
          </div>,
          document.body,
        )}
    </>
  )
}

export function MenuItem({ onClick, children, checked, danger }: { onClick: () => void; children: ReactNode; checked?: boolean; danger?: boolean }) {
  return (
    <button type="button" className={`menu-item ${danger ? '!text-danger' : ''}`} onClick={onClick}>
      <span className="flex min-w-0 flex-1 items-center gap-2 truncate">{children}</span>
      {checked && <Check size={14} className="shrink-0 text-accent" />}
    </button>
  )
}

export function StateIcon({ state, size = 14 }: { state: StateKey; size?: number }) {
  const I = { backlog: CircleDashed, todo: Circle, in_progress: CircleDot, done: CheckCircle2, cancelled: XCircle }[state]
  return <I size={size} color={STATE_COLOR[state]} className="shrink-0" />
}
export function PriorityIcon({ priority, size = 14 }: { priority: PriorityKey; size?: number }) {
  const I = { urgent: CircleAlert, high: SignalHigh, medium: SignalMedium, low: SignalLow, none: Ban }[priority]
  return <I size={size} color={PRIORITY_COLOR[priority]} className="shrink-0" />
}

export function StatePicker({ value, onChange, compact }: { value: StateKey; onChange: (s: StateKey) => void; compact?: boolean }) {
  const t = useT()
  return (
    <Menu trigger={
      <button type="button" className="chip" title={t('state')}>
        <StateIcon state={value} />{!compact && t(`state.${value}`)}
      </button>}>
      {(close) => STATES.map((s) => (
        <MenuItem key={s} checked={s === value} onClick={() => { onChange(s); close() }}>
          <StateIcon state={s} />{t(`state.${s}`)}
        </MenuItem>
      ))}
    </Menu>
  )
}
export function PriorityPicker({ value, onChange, compact }: { value: PriorityKey; onChange: (p: PriorityKey) => void; compact?: boolean }) {
  const t = useT()
  return (
    <Menu trigger={
      <button type="button" className="chip" title={t('priority')}>
        <PriorityIcon priority={value} />{!compact && t(`priority.${value}`)}
      </button>}>
      {(close) => PRIORITIES.map((p) => (
        <MenuItem key={p} checked={p === value} onClick={() => { onChange(p); close() }}>
          <PriorityIcon priority={p} />{t(`priority.${p}`)}
        </MenuItem>
      ))}
    </Menu>
  )
}

export function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  const t = useT()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  return createPortal(
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/50 p-4 pt-[10vh]" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-xl border border-line bg-raised shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button type="button" className="btn-ghost" onClick={onClose} aria-label={t('close')}><X size={16} /></button>
        </div>
        <div className="space-y-3 p-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-4 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  )
}

export function Empty({ icon, title, hint, action }: { icon?: ReactNode; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      {icon && <div className="text-muted">{icon}</div>}
      <div className="text-sm font-medium">{title}</div>
      {hint && <div className="max-w-sm text-[13px] text-muted">{hint}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function PageHeader({ crumbs, actions }: { crumbs: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex min-h-12 flex-wrap items-center gap-2 border-b border-line px-4 py-2">
      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium">{crumbs}</div>
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    </div>
  )
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-hover" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}
