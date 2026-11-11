import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Boxes, ChartColumn, ChevronRight, FileText, Layers, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { useFmtDate, useT, type TKey } from '../i18n'
import { DEFAULT_DISPLAY, PRIORITIES, PRIORITY_COLOR, STATES, STATE_COLOR, addDays, filterCount, isOpen, isOverdue, today, ymd } from '../lib'
import { ItemsView } from '../components/ItemsView'
import { Empty, Field, Modal, PageHeader, Progress } from '../components/ui'
import type { Cycle, Item, Module, ModuleStatus, Project } from '../types'

function useProject(): Project | undefined {
  const { pid } = useParams()
  return useStore((s) => s.projects.find((p) => p.id === pid))
}
function Missing() {
  const t = useT()
  return <Empty title={t('noProject')} action={<Link className="btn" to="/projects">{t('projects')}</Link>} />
}
function Crumbs({ p, section, to, leaf }: { p: Project; section: TKey; to?: string; leaf?: string }) {
  const t = useT()
  return (
    <>
      <Link to={`/p/${p.id}/items`} className="flex items-center gap-1.5 text-muted hover:text-fg"><span>{p.emoji}</span><span className="hidden max-w-40 truncate sm:inline">{p.name}</span></Link>
      <ChevronRight size={14} className="shrink-0 text-muted" />
      {leaf ? <Link to={to!} className="text-muted hover:text-fg">{t(section)}</Link> : <span>{t(section)}</span>}
      {leaf && <><ChevronRight size={14} className="shrink-0 text-muted" /><span className="truncate">{leaf}</span></>}
    </>
  )
}
const pct = (items: Item[]) => (items.length ? (items.filter((i) => i.state === 'done').length / items.length) * 100 : 0)

export function ProjectItems() {
  const p = useProject()
  if (!p) return <Missing />
  return <ItemsView key={p.id} projectId={p.id} scopeKey={p.id} crumbs={<Crumbs p={p} section="workItems" />} />
}

/* ---------- Siklus ---------- */
type CycleTab = 'active' | 'upcoming' | 'completed'
const cycleTab = (c: Cycle): CycleTab => {
  const td = today()
  if (c.endDate && c.endDate < td) return 'completed'
  if (c.startDate && c.startDate <= td) return 'active'
  return 'upcoming'
}

export function Cycles() {
  const t = useT()
  const fmt = useFmtDate()
  const p = useProject()
  const s = useStore()
  const [tab, setTab] = useState<CycleTab>('active')
  const [d, setD] = useState<(Omit<Cycle, 'id'> & { id?: string }) | null>(null)
  if (!p) return <Missing />
  const all = s.cycles.filter((c) => c.projectId === p.id)
  const rows = all.filter((c) => cycleTab(c) === tab)
  const save = () => {
    if (!d || !d.name.trim()) return
    const { id, ...row } = { ...d, name: d.name.trim() }
    if (id) s.upd('cycles', id, row); else s.add('cycles', row)
    setD(null)
  }
  const tabs: [CycleTab, TKey][] = [['active', 'active'], ['upcoming', 'upcoming'], ['completed', 'completedTab']]
  return (
    <div className="flex h-full flex-col">
      <PageHeader crumbs={<Crumbs p={p} section="cycles" />}
        actions={<button type="button" className="btn-primary" onClick={() => setD({ projectId: p.id, name: '', description: '', startDate: today(), endDate: addDays(today(), 13) })}><Plus size={14} />{t('newCycle')}</button>} />
      <div className="flex gap-1 border-b border-line px-4" role="tablist">
        {tabs.map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`-mb-px border-b-2 px-3 py-2 text-[13px] ${tab === k ? 'border-accent font-medium text-fg' : 'border-transparent text-muted hover:text-fg'}`}>
            {t(label)} <span className="text-muted">{all.filter((c) => cycleTab(c) === k).length}</span>
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {rows.length === 0 && <Empty icon={<RefreshCw size={32} />} title={t('emptyCycles')} />}
        {rows.map((c) => {
          const its = s.items.filter((i) => i.cycleId === c.id)
          return (
            <div key={c.id} className="card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/p/${p.id}/cycles/${c.id}`} className="font-medium hover:text-accent">{c.name}</Link>
                <span className="text-xs text-muted">{c.startDate || c.endDate ? `${fmt(c.startDate)} – ${fmt(c.endDate, true)}` : t('draft')}</span>
                <span className="ml-auto text-xs text-muted">{its.filter((i) => i.state === 'done').length}/{its.length} {t('items')}</span>
                <button type="button" className="btn-ghost" aria-label={t('edit')} onClick={() => setD(c)}><Pencil size={14} /></button>
                <button type="button" className="btn-ghost hover:!text-danger" aria-label={t('delete')} onClick={() => window.confirm(t('confirmDelete')) && s.del('cycles', c.id)}><Trash2 size={14} /></button>
              </div>
              {c.description && <p className="mt-1 text-[13px] text-muted">{c.description}</p>}
              <div className="mt-3"><Progress value={pct(its)} /></div>
            </div>
          )
        })}
      </div>
      {d && (
        <Modal title={d.id ? t('edit') : t('newCycle')} onClose={() => setD(null)}
          footer={<><button type="button" className="btn" onClick={() => setD(null)}>{t('cancel')}</button><button type="button" className="btn-primary" disabled={!d.name.trim()} onClick={save}>{t('save')}</button></>}>
          <Field label={t('name')}><input autoFocus className="input" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && save()} /></Field>
          <Field label={t('description')}><textarea className="input" value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('startDate')}><input type="date" className="input" value={d.startDate ?? ''} onChange={(e) => setD({ ...d, startDate: e.target.value || null })} /></Field>
            <Field label={t('endDate')}><input type="date" className="input" min={d.startDate ?? undefined} value={d.endDate ?? ''} onChange={(e) => setD({ ...d, endDate: e.target.value || null })} /></Field>
          </div>
        </Modal>
      )}
    </div>
  )
}

export function CycleDetail() {
  const p = useProject()
  const { cid } = useParams()
  const c = useStore((s) => s.cycles.find((x) => x.id === cid))
  if (!p || !c) return <Missing />
  return <ItemsView key={c.id} projectId={p.id} scopeKey={`cycle:${c.id}`} fixed={{ cycleId: c.id }} crumbs={<Crumbs p={p} section="cycles" to={`/p/${p.id}/cycles`} leaf={c.name} />} />
}

/* ---------- Modul ---------- */
const MSTATUS: ModuleStatus[] = ['planned', 'active', 'paused', 'completed']

export function Modules() {
  const t = useT()
  const fmt = useFmtDate()
  const p = useProject()
  const s = useStore()
  const [d, setD] = useState<(Omit<Module, 'id'> & { id?: string }) | null>(null)
  if (!p) return <Missing />
  const rows = s.modules.filter((m) => m.projectId === p.id)
  const save = () => {
    if (!d || !d.name.trim()) return
    const { id, ...row } = { ...d, name: d.name.trim() }
    if (id) s.upd('modules', id, row); else s.add('modules', row)
    setD(null)
  }
  const newBtn = <button type="button" className="btn-primary" onClick={() => setD({ projectId: p.id, name: '', description: '', status: 'planned', startDate: null, targetDate: null })}><Plus size={14} />{t('newModule')}</button>
  return (
    <div className="flex h-full flex-col">
      <PageHeader crumbs={<Crumbs p={p} section="modules" />} actions={newBtn} />
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {rows.length === 0 ? <Empty icon={<Boxes size={32} />} title={t('emptyModules')} action={newBtn} /> : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((m) => {
              const its = s.items.filter((i) => i.moduleId === m.id)
              return (
                <div key={m.id} className="card flex flex-col p-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/p/${p.id}/modules/${m.id}`} className="min-w-0 flex-1 truncate font-medium hover:text-accent">{m.name}</Link>
                    <select aria-label={t('state')} className="rounded border border-line bg-surface px-1.5 py-0.5 text-xs" value={m.status} onChange={(e) => s.upd('modules', m.id, { status: e.target.value as ModuleStatus })}>
                      {MSTATUS.map((k) => <option key={k} value={k}>{t(`mstatus.${k}`)}</option>)}
                    </select>
                  </div>
                  <p className="mt-1 line-clamp-2 min-h-9 text-[13px] text-muted">{m.description}</p>
                  <div className="mt-2"><Progress value={pct(its)} /></div>
                  <div className="mt-2 flex items-center text-xs text-muted">
                    {its.filter((i) => i.state === 'done').length}/{its.length} {t('items')}{m.targetDate && ` · ${t('targetDate')} ${fmt(m.targetDate)}`}
                    <button type="button" className="btn-ghost ml-auto" aria-label={t('edit')} onClick={() => setD(m)}><Pencil size={14} /></button>
                    <button type="button" className="btn-ghost hover:!text-danger" aria-label={t('delete')} onClick={() => window.confirm(t('confirmDelete')) && s.del('modules', m.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {d && (
        <Modal title={d.id ? t('edit') : t('newModule')} onClose={() => setD(null)}
          footer={<><button type="button" className="btn" onClick={() => setD(null)}>{t('cancel')}</button><button type="button" className="btn-primary" disabled={!d.name.trim()} onClick={save}>{t('save')}</button></>}>
          <Field label={t('name')}><input autoFocus className="input" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && save()} /></Field>
          <Field label={t('description')}><textarea className="input" value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('startDate')}><input type="date" className="input" value={d.startDate ?? ''} onChange={(e) => setD({ ...d, startDate: e.target.value || null })} /></Field>
            <Field label={t('targetDate')}><input type="date" className="input" value={d.targetDate ?? ''} onChange={(e) => setD({ ...d, targetDate: e.target.value || null })} /></Field>
          </div>
        </Modal>
      )}
    </div>
  )
}

export function ModuleDetail() {
  const p = useProject()
  const { mid } = useParams()
  const m = useStore((s) => s.modules.find((x) => x.id === mid))
  if (!p || !m) return <Missing />
  return <ItemsView key={m.id} projectId={p.id} scopeKey={`module:${m.id}`} fixed={{ moduleId: m.id }} crumbs={<Crumbs p={p} section="modules" to={`/p/${p.id}/modules`} leaf={m.name} />} />
}

/* ---------- Tampilan tersimpan ---------- */
export function Views() {
  const t = useT()
  const p = useProject()
  const s = useStore()
  if (!p) return <Missing />
  const rows = s.views.filter((v) => v.projectId === p.id)
  return (
    <div className="flex h-full flex-col">
      <PageHeader crumbs={<Crumbs p={p} section="views" />} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        {rows.length === 0 ? <Empty icon={<Layers size={32} />} title={t('emptyViews')} hint={t('emptyViewsHint')} action={<Link className="btn" to={`/p/${p.id}/items`}>{t('workItems')}</Link>} /> :
          rows.map((v) => (
            <div key={v.id} className="flex items-center gap-2 border-b border-line px-4 py-2.5 hover:bg-hover">
              <Layers size={15} className="text-muted" />
              <Link to={`/p/${p.id}/views/${v.id}`} className="min-w-0 flex-1 truncate font-medium hover:text-accent">{v.name}</Link>
              <span className="text-xs text-muted">{filterCount(v.filters)} {t('filters').toLowerCase()}</span>
              <button type="button" className="btn-ghost hover:!text-danger" aria-label={t('delete')} onClick={() => window.confirm(t('confirmDelete')) && s.del('views', v.id)}><Trash2 size={14} /></button>
            </div>
          ))}
      </div>
    </div>
  )
}

export function ViewDetail() {
  const p = useProject()
  const { vid } = useParams()
  const v = useStore((s) => s.views.find((x) => x.id === vid))
  const setDisplay = useStore((s) => s.setDisplay)
  const key = `view:${vid}`
  const ready = useStore((s) => !!s.display[key])
  // Saat pertama dibuka, isi filter dari tampilan tersimpan.
  useEffect(() => { if (v && !ready) setDisplay(key, { ...DEFAULT_DISPLAY, filters: v.filters }) }, [v, ready, key, setDisplay])
  if (!p || !v) return <Missing />
  if (!ready) return null
  return <ItemsView key={v.id} projectId={p.id} scopeKey={key} crumbs={<Crumbs p={p} section="views" to={`/p/${p.id}/views`} leaf={v.name} />} />
}

/* ---------- Halaman ---------- */
export function ProjectPages() {
  const t = useT()
  const fmt = useFmtDate()
  const p = useProject()
  const { pgid } = useParams()
  const nav = useNavigate()
  const s = useStore()
  if (!p) return <Missing />
  const rows = s.pages.filter((x) => x.projectId === p.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const cur = rows.find((x) => x.id === pgid)
  const add = () => nav(`/p/${p.id}/pages/${s.add('pages', { projectId: p.id, title: '', content: '', updatedAt: new Date().toISOString() })}`)
  const upd = (patch: { title?: string; content?: string }) => cur && s.upd('pages', cur.id, { ...patch, updatedAt: new Date().toISOString() })
  const newBtn = <button type="button" className="btn-primary" onClick={add}><Plus size={14} />{t('newPage')}</button>
  return (
    <div className="flex h-full flex-col">
      <PageHeader crumbs={<Crumbs p={p} section="pages" to={`/p/${p.id}/pages`} leaf={cur ? cur.title || t('untitled') : undefined} />} actions={newBtn} />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className={`${cur ? 'hidden md:block' : ''} shrink-0 overflow-y-auto border-line md:w-64 md:border-r`}>
          {rows.length === 0 && <Empty icon={<FileText size={32} />} title={t('emptyPages')} action={newBtn} />}
          {rows.map((x) => (
            <Link key={x.id} to={`/p/${p.id}/pages/${x.id}`} className={`block border-b border-line px-4 py-2.5 hover:bg-hover ${x.id === pgid ? 'bg-hover' : ''}`}>
              <div className="truncate text-[13px] font-medium">{x.title || t('untitled')}</div>
              <div className="truncate text-xs text-muted">{fmt(x.updatedAt)} · {x.content.slice(0, 60)}</div>
            </Link>
          ))}
        </div>
        {cur && (
          <div className="flex min-h-0 flex-1 flex-col p-5">
            <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
              <div className="flex items-center gap-2">
                <input aria-label={t('title')} className="min-w-0 flex-1 bg-transparent text-2xl font-semibold placeholder:text-muted focus:outline-none" placeholder={t('untitled')} value={cur.title} onChange={(e) => upd({ title: e.target.value })} />
                <button type="button" className="btn-ghost hover:!text-danger" aria-label={t('delete')}
                  onClick={() => { if (window.confirm(t('confirmDelete'))) { s.del('pages', cur.id); nav(`/p/${p.id}/pages`) } }}><Trash2 size={15} /></button>
              </div>
              <div className="mb-3 text-xs text-muted">{t('updated')}: {fmt(cur.updatedAt, true)}</div>
              <textarea aria-label={t('pages')} className="min-h-0 flex-1 resize-none bg-transparent text-[15px] leading-relaxed placeholder:text-muted focus:outline-none" placeholder={t('pagePh')} value={cur.content} onChange={(e) => upd({ content: e.target.value })} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Analitik ---------- */
function Bars({ title, rows }: { title: string; rows: { label: string; value: number; color: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <section className="card p-4">
      <h2 className="mb-3 text-[13px] font-semibold">{title}</h2>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3 text-[13px]">
            <div className="w-32 shrink-0 truncate text-muted">{r.label}</div>
            <div className="h-4 flex-1 overflow-hidden rounded bg-hover"><div className="h-full rounded" style={{ width: `${(r.value / max) * 100}%`, background: r.color }} /></div>
            <div className="w-8 shrink-0 text-right tabular-nums">{r.value}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function Analytics() {
  const t = useT()
  const fmt = useFmtDate()
  const p = useProject()
  const s = useStore()
  if (!p) return <Missing />
  const its = s.items.filter((i) => i.projectId === p.id)
  const labels = s.labels.filter((l) => l.projectId === p.id)
  const days = Array.from({ length: 14 }, (_, n) => addDays(today(), n - 13))
  const local = (iso: string | null) => (iso ? ymd(new Date(iso)) : '')
  const series = days.map((d) => ({ d, created: its.filter((i) => local(i.createdAt) === d).length, done: its.filter((i) => local(i.completedAt) === d).length }))
  const max = Math.max(1, ...series.flatMap((x) => [x.created, x.done]))
  const cards: [string, ReactNode][] = [
    [t('total'), its.length], [t('open'), its.filter(isOpen).length], [t('overdue'), its.filter(isOverdue).length],
    [t('progress'), `${Math.round(pct(its))}%`],
  ]
  return (
    <div className="flex h-full flex-col">
      <PageHeader crumbs={<Crumbs p={p} section="analytics" />} />
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {its.length === 0 ? <Empty icon={<ChartColumn size={32} />} title={t('emptyItems')} /> : (
          <div className="mx-auto max-w-4xl space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {cards.map(([label, v]) => <div key={label} className="card p-3"><div className="text-xs text-muted">{label}</div><div className="text-2xl font-semibold tabular-nums">{v}</div></div>)}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Bars title={t('byState')} rows={STATES.map((k) => ({ label: t(`state.${k}`), value: its.filter((i) => i.state === k).length, color: STATE_COLOR[k] }))} />
              <Bars title={t('byPriority')} rows={PRIORITIES.map((k) => ({ label: t(`priority.${k}`), value: its.filter((i) => i.priority === k).length, color: PRIORITY_COLOR[k] }))} />
            </div>
            {labels.length > 0 && <Bars title={t('byLabel')} rows={labels.map((l) => ({ label: l.name, value: its.filter((i) => i.labelIds.includes(l.id)).length, color: l.color }))} />}
            <section className="card p-4">
              <div className="mb-3 flex flex-wrap items-center gap-4">
                <h2 className="text-[13px] font-semibold">{t('last14')}</h2>
                <span className="flex items-center gap-1.5 text-xs text-muted"><span className="size-2.5 rounded-sm" style={{ background: STATE_COLOR.todo }} />{t('createdSeries')}</span>
                <span className="flex items-center gap-1.5 text-xs text-muted"><span className="size-2.5 rounded-sm" style={{ background: STATE_COLOR.done }} />{t('completedSeries')}</span>
              </div>
              <div className="flex h-40 items-end gap-1.5">
                {series.map((x) => (
                  <div key={x.d} className="flex h-full flex-1 flex-col justify-end" title={`${fmt(x.d)} — ${t('createdSeries')}: ${x.created}, ${t('completedSeries')}: ${x.done}`}>
                    <div className="flex flex-1 items-end justify-center gap-0.5">
                      <div className="w-1/2 max-w-3 rounded-t" style={{ height: `${(x.created / max) * 100}%`, background: STATE_COLOR.todo }} />
                      <div className="w-1/2 max-w-3 rounded-t" style={{ height: `${(x.done / max) * 100}%`, background: STATE_COLOR.done }} />
                    </div>
                    <div className="mt-1 text-center text-[10px] text-muted">{x.d.slice(8)}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
