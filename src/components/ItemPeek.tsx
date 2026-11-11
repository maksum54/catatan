import { useEffect, useState, type ReactNode } from 'react'
import { Boxes, CalendarDays, CornerDownRight, Plus, RefreshCw, Tag, Trash2, X } from 'lucide-react'
import { useStore } from '../store'
import { useFmtDate, useT } from '../i18n'
import { LABEL_COLORS, toggle } from '../lib'
import { Field, Menu, MenuItem, Modal, PriorityPicker, StateIcon, StatePicker } from './ui'
import type { Item, PriorityKey, StateKey } from '../types'

function Prop({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-8 items-center gap-2">
      <div className="flex w-32 shrink-0 items-center gap-2 text-[13px] text-muted">{icon}{label}</div>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">{children}</div>
    </div>
  )
}

export function ItemPeek() {
  const t = useT()
  const fmt = useFmtDate()
  const s = useStore()
  const item = s.items.find((i) => i.id === s.peekId)
  const [sub, setSub] = useState('')
  const [newLabel, setNewLabel] = useState('')
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !(e.target as HTMLElement).closest('input,textarea,[role=dialog]')) s.setPeek(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [s])
  if (!item) return null
  const project = s.projects.find((p) => p.id === item.projectId)
  const labels = s.labels.filter((l) => l.projectId === item.projectId)
  const cycles = s.cycles.filter((c) => c.projectId === item.projectId)
  const modules = s.modules.filter((m) => m.projectId === item.projectId)
  const children = s.items.filter((i) => i.parentId === item.id)
  const parent = s.items.find((i) => i.id === item.parentId)
  const candidates = s.items.filter((i) => i.projectId === item.projectId && i.id !== item.id && i.parentId !== item.id && !i.parentId)
  const upd = (patch: Partial<Item>) => s.updItem(item.id, patch)
  const key = (i: Item) => `${project?.identifier}-${i.seq}`

  return (
    <aside aria-label={item.title}
      className="fixed bottom-0 right-0 top-12 z-30 flex w-full max-w-[560px] flex-col border-l border-t border-line bg-surface shadow-2xl md:rounded-tl-lg">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <button type="button" className="btn-ghost" onClick={() => s.setPeek(null)} aria-label={t('close')}><X size={16} /></button>
        <span className="text-xs text-muted">{key(item)}</span>
        <button type="button" className="btn-ghost ml-auto hover:!text-danger" aria-label={t('delete')}
          onClick={() => window.confirm(t('confirmDelete')) && s.delItem(item.id)}><Trash2 size={15} /></button>
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        {parent && (
          <button type="button" className="flex items-center gap-1.5 text-xs text-muted hover:text-fg" onClick={() => s.setPeek(parent.id)}>
            <CornerDownRight size={12} />{key(parent)} · {parent.title}
          </button>
        )}
        <textarea aria-label={t('title')} rows={1} value={item.title} placeholder={t('titlePh')} onChange={(e) => upd({ title: e.target.value })}
          className="w-full resize-none bg-transparent text-xl font-semibold leading-snug placeholder:text-muted focus:outline-none [field-sizing:content]" />
        <textarea aria-label={t('description')} value={item.description} placeholder={t('descriptionPh')} onChange={(e) => upd({ description: e.target.value })}
          className="input min-h-28 resize-y leading-relaxed" />

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">{t('subItems')} {children.length > 0 && <span className="text-muted">{children.filter((c) => c.state === 'done').length}/{children.length}</span>}</h3>
          </div>
          {children.map((c) => (
            <button key={c.id} type="button" onClick={() => s.setPeek(c.id)} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[13px] hover:bg-hover">
              <StateIcon state={c.state} /><span className="text-xs text-muted">{key(c)}</span><span className="truncate">{c.title}</span>
            </button>
          ))}
          {!item.parentId && (
            <div className="mt-1 flex gap-2">
              <input className="input" placeholder={t('addSubItem')} value={sub} onChange={(e) => setSub(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && sub.trim()) { s.addItem(item.projectId, { title: sub.trim(), parentId: item.id, cycleId: item.cycleId, moduleId: item.moduleId }); setSub('') } }} />
            </div>
          )}
        </section>

        <section className="space-y-1">
          <h3 className="mb-2 text-[13px] font-semibold">{t('properties')}</h3>
          <Prop icon={<StateIcon state={item.state} />} label={t('state')}><StatePicker value={item.state} onChange={(state) => upd({ state })} /></Prop>
          <Prop icon={<span className="size-3.5" />} label={t('priority')}><PriorityPicker value={item.priority} onChange={(priority) => upd({ priority })} /></Prop>
          <Prop icon={<CalendarDays size={14} />} label={t('startDate')}>
            <input aria-label={t('startDate')} type="date" className="chip" value={item.startDate ?? ''} onChange={(e) => upd({ startDate: e.target.value || null })} />
          </Prop>
          <Prop icon={<CalendarDays size={14} />} label={t('dueDate')}>
            <input aria-label={t('dueDate')} type="date" className="chip" value={item.dueDate ?? ''} onChange={(e) => upd({ dueDate: e.target.value || null })} />
          </Prop>
          <Prop icon={<Tag size={14} />} label={t('labels')}>
            {labels.filter((l) => item.labelIds.includes(l.id)).map((l) => (
              <span key={l.id} className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-xs">
                <span className="size-2 rounded-full" style={{ background: l.color }} />{l.name}
              </span>
            ))}
            <Menu width={220} trigger={<button type="button" className="chip text-muted"><Plus size={12} />{t('labels')}</button>}>
              {labels.map((l) => (
                <div key={l.id} className="flex items-center">
                  <MenuItem checked={item.labelIds.includes(l.id)} onClick={() => upd({ labelIds: toggle(item.labelIds, l.id) })}>
                    <span className="size-2.5 rounded-full" style={{ background: l.color }} />{l.name}
                  </MenuItem>
                  <button type="button" className="btn-ghost hover:!text-danger" aria-label={`${t('delete')} ${l.name}`} onClick={() => s.del('labels', l.id)}><X size={12} /></button>
                </div>
              ))}
              <input className="input mt-1" placeholder={t('newLabel')} value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newLabel.trim()) {
                    const id = s.add('labels', { projectId: item.projectId, name: newLabel.trim(), color: LABEL_COLORS[labels.length % LABEL_COLORS.length] })
                    upd({ labelIds: [...item.labelIds, id] }); setNewLabel('')
                  }
                }} />
            </Menu>
          </Prop>
          {children.length === 0 && (
            <Prop icon={<CornerDownRight size={14} />} label={t('parent')}>
              <Menu width={280} trigger={<button type="button" className="chip max-w-64"><span className="truncate">{parent ? `${key(parent)} · ${parent.title}` : t('none')}</span></button>}>
                {(close) => (
                  <>
                    <MenuItem checked={!parent} onClick={() => { upd({ parentId: null }); close() }}>{t('none')}</MenuItem>
                    {candidates.map((c) => (
                      <MenuItem key={c.id} checked={c.id === item.parentId} onClick={() => { upd({ parentId: c.id }); close() }}>
                        <span className="text-xs text-muted">{key(c)}</span><span className="truncate">{c.title}</span>
                      </MenuItem>
                    ))}
                  </>
                )}
              </Menu>
            </Prop>
          )}
          <Prop icon={<RefreshCw size={14} />} label={t('cycle')}>
            <Menu trigger={<button type="button" className="chip max-w-64"><span className="truncate">{cycles.find((c) => c.id === item.cycleId)?.name ?? t('none')}</span></button>}>
              {(close) => (
                <>
                  <MenuItem checked={!item.cycleId} onClick={() => { upd({ cycleId: null }); close() }}>{t('none')}</MenuItem>
                  {cycles.map((c) => <MenuItem key={c.id} checked={c.id === item.cycleId} onClick={() => { upd({ cycleId: c.id }); close() }}>{c.name}</MenuItem>)}
                </>
              )}
            </Menu>
          </Prop>
          <Prop icon={<Boxes size={14} />} label={t('module')}>
            <Menu trigger={<button type="button" className="chip max-w-64"><span className="truncate">{modules.find((m) => m.id === item.moduleId)?.name ?? t('none')}</span></button>}>
              {(close) => (
                <>
                  <MenuItem checked={!item.moduleId} onClick={() => { upd({ moduleId: null }); close() }}>{t('none')}</MenuItem>
                  {modules.map((m) => <MenuItem key={m.id} checked={m.id === item.moduleId} onClick={() => { upd({ moduleId: m.id }); close() }}>{m.name}</MenuItem>)}
                </>
              )}
            </Menu>
          </Prop>
        </section>

        <div className="space-y-0.5 border-t border-line pt-3 text-xs text-muted">
          <div>{t('created')}: {fmt(item.createdAt, true)}</div>
          <div>{t('updated')}: {fmt(item.updatedAt, true)}</div>
          {item.completedAt && <div>{t('completed')}: {fmt(item.completedAt, true)}</div>}
        </div>
      </div>
    </aside>
  )
}

export function CreateItemModal() {
  const t = useT()
  const s = useStore()
  const cf = s.createFor
  const [projectId, setProjectId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [state, setState] = useState<StateKey>('backlog')
  const [priority, setPriority] = useState<PriorityKey>('none')
  const [dueDate, setDueDate] = useState('')
  useEffect(() => {
    if (!cf) return
    setProjectId(cf.projectId); setTitle(''); setDescription('')
    setState(cf.preset.state ?? 'backlog'); setPriority(cf.preset.priority ?? 'none'); setDueDate(cf.preset.dueDate ?? '')
  }, [cf])
  if (!cf) return null
  const submit = () => {
    if (!title.trim() || !projectId) return
    // Preset (mis. siklus/modul) hanya berlaku bila proyeknya tidak diganti.
    const preset = projectId === cf.projectId ? cf.preset : {}
    s.addItem(projectId, { ...preset, title: title.trim(), description, state, priority, dueDate: dueDate || null })
    s.closeCreate()
  }
  return (
    <Modal title={t('addWorkItem')} onClose={s.closeCreate}
      footer={<>
        <button type="button" className="btn" onClick={s.closeCreate}>{t('cancel')}</button>
        <button type="button" className="btn-primary" disabled={!title.trim()} onClick={submit}>{t('create')}</button>
      </>}>
      <Field label={t('project')}>
        <select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          {s.projects.map((p) => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
        </select>
      </Field>
      <Field label={t('title')}>
        <input autoFocus className="input" placeholder={t('titlePh')} value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
      </Field>
      <Field label={t('description')}>
        <textarea className="input min-h-20" placeholder={t('descriptionPh')} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <div className="flex flex-wrap items-center gap-2">
        <StatePicker value={state} onChange={setState} />
        <PriorityPicker value={priority} onChange={setPriority} />
        <input aria-label={t('dueDate')} type="date" className="chip" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
    </Modal>
  )
}
