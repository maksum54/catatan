import { useMemo, useState, type ReactNode } from 'react'
import { Bookmark, CalendarDays, ChartGantt, ChevronLeft, ChevronRight, Columns3, Ellipsis, Inbox, Layers, List, ListFilter, Plus, RefreshCw, SlidersHorizontal, Table2, Trash2, Boxes } from 'lucide-react'
import { useStore } from '../store'
import { useFmtDate, useT, type T } from '../i18n'
import { DEFAULT_DISPLAY, EMPTY_FILTERS, PRIORITIES, STATES, addDays, applyFilters, diffDays, filterCount, isOverdue, parseYmd, STATE_COLOR, today, toggle, ymd } from '../lib'
import type { Cycle, GroupBy, Item, Label, Layout, Module, Project } from '../types'
import { Empty, Menu, MenuItem, PageHeader, PriorityIcon, PriorityPicker, StateIcon, StatePicker } from './ui'

interface Group { key: string; label: string; icon: ReactNode; patch: Partial<Item>; match: (i: Item) => boolean }
interface Ctx {
  project: Project; items: Item[]; groups: Group[]; labels: Label[]; cycles: Cycle[]; modules: Module[]
  add: (title: string, patch?: Partial<Item>) => void
}

function buildGroups(by: GroupBy, t: T, cycles: Cycle[], modules: Module[]): Group[] {
  if (by === 'state')
    return STATES.map((s) => ({ key: s, label: t(`state.${s}`), icon: <StateIcon state={s} />, patch: { state: s }, match: (i) => i.state === s }))
  if (by === 'priority')
    return PRIORITIES.map((p) => ({ key: p, label: t(`priority.${p}`), icon: <PriorityIcon priority={p} />, patch: { priority: p }, match: (i) => i.priority === p }))
  if (by === 'cycle')
    return [
      ...cycles.map((c) => ({ key: c.id, label: c.name, icon: <RefreshCw size={14} className="text-muted" />, patch: { cycleId: c.id }, match: (i: Item) => i.cycleId === c.id })),
      { key: '-', label: t('none'), icon: <RefreshCw size={14} className="text-muted" />, patch: { cycleId: null }, match: (i: Item) => !i.cycleId },
    ]
  if (by === 'module')
    return [
      ...modules.map((m) => ({ key: m.id, label: m.name, icon: <Boxes size={14} className="text-muted" />, patch: { moduleId: m.id }, match: (i: Item) => i.moduleId === m.id })),
      { key: '-', label: t('none'), icon: <Boxes size={14} className="text-muted" />, patch: { moduleId: null }, match: (i: Item) => !i.moduleId },
    ]
  return [{ key: 'all', label: t('allItems'), icon: <Layers size={14} className="text-muted" />, patch: {}, match: () => true }]
}

const LAYOUTS: [Layout, typeof List][] = [['list', List], ['board', Columns3], ['calendar', CalendarDays], ['table', Table2], ['gantt', ChartGantt]]

export function ItemsView({ projectId, scopeKey, fixed = {}, crumbs }: {
  projectId: string; scopeKey: string; fixed?: Partial<Item>; crumbs: ReactNode
}) {
  const t = useT()
  const s = useStore()
  const disp = s.display[scopeKey] ?? DEFAULT_DISPLAY
  const set = (patch: Partial<typeof disp>) => s.setDisplay(scopeKey, patch)
  const project = s.projects.find((p) => p.id === projectId)!
  const labels = useMemo(() => s.labels.filter((l) => l.projectId === projectId), [s.labels, projectId])
  const cycles = useMemo(() => s.cycles.filter((c) => c.projectId === projectId), [s.cycles, projectId])
  const modules = useMemo(() => s.modules.filter((m) => m.projectId === projectId), [s.modules, projectId])
  const fixedKey = JSON.stringify(fixed)
  const scoped = useMemo(
    () => s.items.filter((i) => i.projectId === projectId && Object.entries(fixed).every(([k, v]) => i[k as keyof Item] === v)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.items, projectId, fixedKey],
  )
  const items = useMemo(
    () => applyFilters(scoped, disp.filters).filter((i) => disp.showSub || !i.parentId).sort((a, b) => a.seq - b.seq),
    [scoped, disp.filters, disp.showSub],
  )
  const groupBy: GroupBy = disp.layout === 'board' && disp.groupBy === 'none' ? 'state' : disp.groupBy
  const groups = useMemo(() => buildGroups(groupBy, t, cycles, modules), [groupBy, t, cycles, modules])
  const add = (title: string, patch: Partial<Item> = {}) => {
    if (title.trim()) s.addItem(projectId, { ...fixed, ...patch, title: title.trim() })
  }
  const ctx: Ctx = { project, items, groups, labels, cycles, modules, add }
  const fc = filterCount(disp.filters)
  const f = disp.filters
  const setF = (patch: Partial<typeof f>) => set({ filters: { ...f, ...patch } })

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        crumbs={<>{crumbs}<span className="rounded-full bg-hover px-2 py-0.5 text-xs text-muted">{items.length}</span></>}
        actions={
          <>
            <div className="flex rounded-md border border-line p-0.5" role="tablist">
              {LAYOUTS.map(([k, I]) => (
                <button key={k} type="button" role="tab" aria-selected={disp.layout === k} title={t(`layout.${k}`)} aria-label={t(`layout.${k}`)}
                  onClick={() => set({ layout: k })}
                  className={`rounded p-1.5 ${disp.layout === k ? 'bg-hover text-fg' : 'text-muted hover:text-fg'}`}>
                  <I size={15} />
                </button>
              ))}
            </div>
            <Menu width={240} trigger={
              <button type="button" className="btn"><ListFilter size={14} />{t('filters')}
                {fc > 0 && <span className="rounded-full bg-accent px-1.5 text-[11px] text-accent-fg">{fc}</span>}
              </button>}>
              <input className="input mb-1" placeholder={t('title')} value={f.query} onChange={(e) => setF({ query: e.target.value })} />
              <div className="px-2 pt-1 text-[11px] font-semibold uppercase text-muted">{t('state')}</div>
              {STATES.map((k) => (
                <MenuItem key={k} checked={f.states.includes(k)} onClick={() => setF({ states: toggle(f.states, k) })}><StateIcon state={k} />{t(`state.${k}`)}</MenuItem>
              ))}
              <div className="px-2 pt-2 text-[11px] font-semibold uppercase text-muted">{t('priority')}</div>
              {PRIORITIES.map((k) => (
                <MenuItem key={k} checked={f.priorities.includes(k)} onClick={() => setF({ priorities: toggle(f.priorities, k) })}><PriorityIcon priority={k} />{t(`priority.${k}`)}</MenuItem>
              ))}
              {labels.length > 0 && <div className="px-2 pt-2 text-[11px] font-semibold uppercase text-muted">{t('labels')}</div>}
              {labels.map((l) => (
                <MenuItem key={l.id} checked={f.labelIds.includes(l.id)} onClick={() => setF({ labelIds: toggle(f.labelIds, l.id) })}>
                  <span className="size-2.5 rounded-full" style={{ background: l.color }} />{l.name}
                </MenuItem>
              ))}
              <div className="mt-1 border-t border-line pt-1">
                <MenuItem onClick={() => set({ filters: EMPTY_FILTERS })}>{t('clear')}</MenuItem>
                <MenuItem onClick={() => {
                  const name = window.prompt(t('viewName'))
                  if (name?.trim()) s.add('views', { projectId, name: name.trim(), filters: f })
                }}><Bookmark size={14} />{t('saveView')}</MenuItem>
              </div>
            </Menu>
            <Menu trigger={<button type="button" className="btn"><SlidersHorizontal size={14} />{t('display')}</button>}>
              <div className="px-2 pt-1 text-[11px] font-semibold uppercase text-muted">{t('groupBy')}</div>
              {(['state', 'priority', 'cycle', 'module', 'none'] as GroupBy[]).map((g) => (
                <MenuItem key={g} checked={disp.groupBy === g} onClick={() => set({ groupBy: g })}>{t(`group.${g}`)}</MenuItem>
              ))}
              <div className="mt-1 border-t border-line pt-1">
                <MenuItem checked={disp.showSub} onClick={() => set({ showSub: !disp.showSub })}>{t('showSub')}</MenuItem>
              </div>
            </Menu>
            <button type="button" className="btn-primary" onClick={() => s.openCreate(projectId, fixed)}><Plus size={14} />{t('addWorkItem')}</button>
          </>
        }
      />
      <div className="min-h-0 flex-1 overflow-auto">
        {scoped.length === 0 ? (
          <Empty icon={<Inbox size={32} />} title={t('emptyItems')} hint={t('emptyItemsHint')}
            action={<button type="button" className="btn-primary" onClick={() => s.openCreate(projectId, fixed)}><Plus size={14} />{t('addWorkItem')}</button>} />
        ) : items.length === 0 ? (
          <Empty title={t('emptyFiltered')} action={<button type="button" className="btn" onClick={() => set({ filters: EMPTY_FILTERS })}>{t('clear')}</button>} />
        ) : disp.layout === 'list' ? <ListLayout {...ctx} />
          : disp.layout === 'board' ? <BoardLayout {...ctx} />
          : disp.layout === 'calendar' ? <CalendarLayout {...ctx} />
          : disp.layout === 'table' ? <TableLayout {...ctx} />
          : <GanttLayout {...ctx} />}
      </div>
    </div>
  )
}

function InlineAdd({ onAdd, className = '' }: { onAdd: (title: string) => void; className?: string }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [v, setV] = useState('')
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className={`flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-muted hover:bg-hover hover:text-fg ${className}`}>
        <Plus size={14} />{t('newWorkItem')}
      </button>
    )
  return (
    <div className={`px-3 py-1.5 ${className}`}>
      <input autoFocus className="input" placeholder={t('titlePh')} value={v} onChange={(e) => setV(e.target.value)}
        onBlur={() => { setOpen(false); setV('') }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && v.trim()) { onAdd(v); setV('') }
          if (e.key === 'Escape') { setOpen(false); setV('') }
        }} />
    </div>
  )
}

function LabelDots({ item, labels }: { item: Item; labels: Label[] }) {
  const ls = labels.filter((l) => item.labelIds.includes(l.id))
  if (!ls.length) return null
  return (
    <span className="hidden items-center gap-1 sm:flex">
      {ls.map((l) => (
        <span key={l.id} className="inline-flex items-center gap-1 rounded-full border border-line px-1.5 py-0.5 text-[11px] text-muted">
          <span className="size-2 rounded-full" style={{ background: l.color }} />{l.name}
        </span>
      ))}
    </span>
  )
}

function DueChip({ item }: { item: Item }) {
  const fmt = useFmtDate()
  if (!item.dueDate) return null
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap text-xs ${isOverdue(item) ? 'text-danger' : 'text-muted'}`}>
      <CalendarDays size={12} />{fmt(item.dueDate)}
    </span>
  )
}

function RowMenu({ item }: { item: Item }) {
  const t = useT()
  const s = useStore()
  return (
    <Menu width={160} trigger={<button type="button" className="btn-ghost" aria-label={t('more')}><Ellipsis size={15} /></button>}>
      {(close) => (
        <>
          <MenuItem onClick={() => { s.setPeek(item.id); close() }}>{t('openItem')}</MenuItem>
          <MenuItem danger onClick={() => { if (window.confirm(t('confirmDelete'))) s.delItem(item.id); close() }}><Trash2 size={14} />{t('delete')}</MenuItem>
        </>
      )}
    </Menu>
  )
}

function ListLayout({ project, items, groups, labels, add }: Ctx) {
  const s = useStore()
  return (
    <div>
      {groups.map((g) => {
        const rows = items.filter(g.match)
        return (
          <section key={g.key}>
            <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-line bg-app px-4 py-2 text-[13px] font-medium">
              {g.icon}<span>{g.label}</span><span className="text-muted">{rows.length}</span>
            </div>
            {rows.map((i) => (
              <div key={i.id} role="button" tabIndex={0} onClick={() => s.setPeek(i.id)} onKeyDown={(e) => e.key === 'Enter' && s.setPeek(i.id)}
                className={`flex cursor-pointer items-center gap-3 border-b border-line px-4 py-2 hover:bg-hover ${s.peekId === i.id ? 'bg-hover' : 'bg-surface'}`}>
                <span className="w-16 shrink-0 text-xs text-muted">{project.identifier}-{i.seq}</span>
                <span className={`min-w-0 flex-1 truncate ${i.parentId ? 'pl-3' : ''}`}>{i.title}</span>
                <LabelDots item={i} labels={labels} />
                <DueChip item={i} />
                <StatePicker value={i.state} onChange={(state) => s.updItem(i.id, { state })} compact />
                <PriorityPicker value={i.priority} onChange={(priority) => s.updItem(i.id, { priority })} compact />
                <RowMenu item={i} />
              </div>
            ))}
            <InlineAdd className="border-b border-line bg-surface" onAdd={(title) => add(title, g.patch)} />
          </section>
        )
      })}
    </div>
  )
}

function BoardLayout({ project, items, groups, labels, add }: Ctx) {
  const s = useStore()
  const [over, setOver] = useState<string | null>(null)
  return (
    <div className="flex h-full gap-3 overflow-x-auto p-3">
      {groups.map((g) => {
        const rows = items.filter(g.match)
        return (
          <div key={g.key}
            onDragOver={(e) => { e.preventDefault(); setOver(g.key) }}
            onDragLeave={() => setOver((o) => (o === g.key ? null : o))}
            onDrop={(e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData('text/item'); if (id) s.updItem(id, g.patch) }}
            className={`flex w-72 shrink-0 flex-col rounded-lg border ${over === g.key ? 'border-accent' : 'border-line'} bg-surface`}>
            <div className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium">{g.icon}<span className="truncate">{g.label}</span><span className="text-muted">{rows.length}</span></div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-2 pb-1">
              {rows.map((i) => (
                <div key={i.id} draggable onDragStart={(e) => e.dataTransfer.setData('text/item', i.id)}
                  role="button" tabIndex={0} onClick={() => s.setPeek(i.id)} onKeyDown={(e) => e.key === 'Enter' && s.setPeek(i.id)}
                  className="cursor-pointer space-y-2 rounded-md border border-line bg-raised p-2.5 hover:border-muted">
                  <div className="text-[11px] text-muted">{project.identifier}-{i.seq}</div>
                  <div className="text-[13px] leading-snug">{i.title}</div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatePicker value={i.state} onChange={(state) => s.updItem(i.id, { state })} compact />
                    <PriorityPicker value={i.priority} onChange={(priority) => s.updItem(i.id, { priority })} compact />
                    <DueChip item={i} />
                    {labels.filter((l) => i.labelIds.includes(l.id)).map((l) => <span key={l.id} title={l.name} className="size-2.5 rounded-full" style={{ background: l.color }} />)}
                  </div>
                </div>
              ))}
            </div>
            <InlineAdd className="rounded-b-lg" onAdd={(title) => add(title, g.patch)} />
          </div>
        )
      })}
    </div>
  )
}

function CalendarLayout({ items, add }: Ctx) {
  const t = useT()
  const s = useStore()
  const lang = useStore((x) => x.lang)
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const [over, setOver] = useState<string | null>(null)
  const loc = lang === 'id' ? 'id-ID' : 'en-US'
  const start = new Date(month); start.setDate(1 - ((month.getDay() + 6) % 7)) // mulai hari Senin
  const days = Array.from({ length: 42 }, (_, n) => { const d = new Date(start); d.setDate(start.getDate() + n); return d })
  const shift = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1))
  const td = today()
  return (
    <div className="flex h-full min-w-[640px] flex-col p-3">
      <div className="mb-2 flex items-center gap-2">
        <button type="button" className="btn-ghost" onClick={() => shift(-1)} aria-label={t('prev')}><ChevronLeft size={16} /></button>
        <button type="button" className="btn-ghost" onClick={() => shift(1)} aria-label={t('next')}><ChevronRight size={16} /></button>
        <div className="text-sm font-semibold capitalize">{month.toLocaleDateString(loc, { month: 'long', year: 'numeric' })}</div>
        <button type="button" className="btn ml-auto" onClick={() => { const d = new Date(); setMonth(new Date(d.getFullYear(), d.getMonth(), 1)) }}>{t('today')}</button>
      </div>
      <div className="grid grid-cols-7 text-center text-[11px] font-medium uppercase text-muted">
        {days.slice(0, 7).map((d) => <div key={d.getDay()} className="py-1">{d.toLocaleDateString(loc, { weekday: 'short' })}</div>)}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 overflow-hidden rounded-lg border border-line">
        {days.map((d) => {
          const key = ymd(d)
          const dayItems = items.filter((i) => i.dueDate === key)
          const out = d.getMonth() !== month.getMonth()
          return (
            <div key={key}
              onDragOver={(e) => { e.preventDefault(); setOver(key) }}
              onDrop={(e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData('text/item'); if (id) s.updItem(id, { dueDate: key }) }}
              className={`group min-h-20 overflow-hidden border-b border-r border-line p-1 ${out ? 'bg-app' : 'bg-surface'} ${over === key ? 'ring-1 ring-inset ring-accent' : ''}`}>
              <div className="mb-0.5 flex items-center justify-between">
                <span className={`inline-flex size-5 items-center justify-center rounded-full text-[11px] ${key === td ? 'bg-accent font-semibold text-accent-fg' : out ? 'text-muted/60' : 'text-muted'}`}>{d.getDate()}</span>
                <button type="button" aria-label={t('addWorkItem')} className="rounded p-0.5 text-muted opacity-0 hover:bg-hover focus:opacity-100 group-hover:opacity-100"
                  onClick={() => { const title = window.prompt(t('titlePh')); if (title) add(title, { dueDate: key }) }}><Plus size={12} /></button>
              </div>
              <div className="space-y-0.5">
                {dayItems.slice(0, 3).map((i) => (
                  <button key={i.id} type="button" draggable onDragStart={(e) => e.dataTransfer.setData('text/item', i.id)} onClick={() => s.setPeek(i.id)}
                    className="flex w-full items-center gap-1 truncate rounded bg-hover px-1 py-0.5 text-left text-[11px]">
                    <StateIcon state={i.state} size={11} /><span className="truncate">{i.title}</span>
                  </button>
                ))}
                {dayItems.length > 3 && <div className="px-1 text-[11px] text-muted">+{dayItems.length - 3}</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TableLayout({ project, items, cycles, modules, add }: Ctx) {
  const t = useT()
  const s = useStore()
  const th = 'border-b border-r border-line bg-app px-3 py-2 text-left text-xs font-medium text-muted whitespace-nowrap sticky top-0'
  const td = 'border-b border-r border-line px-2 py-1'
  const sel = 'w-full rounded bg-transparent px-1 py-1 text-[13px] hover:bg-hover'
  return (
    <div>
      <table className="w-full min-w-[900px] border-collapse bg-surface text-[13px]">
        <thead>
          <tr>
            <th className={th}>{t('identifier')}</th><th className={`${th} w-[32%]`}>{t('title')}</th><th className={th}>{t('state')}</th>
            <th className={th}>{t('priority')}</th><th className={th}>{t('startDate')}</th><th className={th}>{t('dueDate')}</th>
            <th className={th}>{t('cycle')}</th><th className={th}>{t('module')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id} className="hover:bg-hover/50">
              <td className={`${td} whitespace-nowrap`}>
                <button type="button" className="px-1 text-xs text-muted hover:text-accent hover:underline" onClick={() => s.setPeek(i.id)}>{project.identifier}-{i.seq}</button>
              </td>
              <td className={td}><input aria-label={t('title')} className={sel} value={i.title} onChange={(e) => s.updItem(i.id, { title: e.target.value })} /></td>
              <td className={td}><StatePicker value={i.state} onChange={(state) => s.updItem(i.id, { state })} /></td>
              <td className={td}><PriorityPicker value={i.priority} onChange={(priority) => s.updItem(i.id, { priority })} /></td>
              <td className={td}><input aria-label={t('startDate')} type="date" className={sel} value={i.startDate ?? ''} onChange={(e) => s.updItem(i.id, { startDate: e.target.value || null })} /></td>
              <td className={td}><input aria-label={t('dueDate')} type="date" className={sel} value={i.dueDate ?? ''} onChange={(e) => s.updItem(i.id, { dueDate: e.target.value || null })} /></td>
              <td className={td}>
                <select aria-label={t('cycle')} className={sel} value={i.cycleId ?? ''} onChange={(e) => s.updItem(i.id, { cycleId: e.target.value || null })}>
                  <option value="">—</option>{cycles.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </td>
              <td className={td}>
                <select aria-label={t('module')} className={sel} value={i.moduleId ?? ''} onChange={(e) => s.updItem(i.id, { moduleId: e.target.value || null })}>
                  <option value="">—</option>{modules.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <InlineAdd onAdd={(title) => add(title)} />
    </div>
  )
}

function GanttLayout({ project, items }: Ctx) {
  const t = useT()
  const s = useStore()
  const fmt = useFmtDate()
  const dated = items.filter((i) => i.startDate || i.dueDate)
  if (!dated.length) return <Empty icon={<ChartGantt size={32} />} title={t('noDates')} />
  const span = (i: Item) => {
    const a = (i.startDate ?? i.dueDate)!, b = (i.dueDate ?? i.startDate)!
    return a <= b ? [a, b] : [b, a]
  }
  const td = today()
  let min = td, max = td
  for (const i of dated) { const [a, b] = span(i); if (a < min) min = a; if (b > max) max = b }
  min = addDays(min, -3)
  const total = Math.max(diffDays(min, max) + 4, 28)
  const W = 34, LEFT = 220
  const days = Array.from({ length: total }, (_, n) => addDays(min, n))
  return (
    <div className="p-3">
      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <div style={{ width: LEFT + total * W }} className="relative">
          <div className="flex border-b border-line text-[11px] text-muted">
            <div style={{ width: LEFT }} className="sticky left-0 z-20 shrink-0 border-r border-line bg-surface px-3 py-2 font-medium">{t('workItems')}</div>
            {days.map((d) => {
              const wd = parseYmd(d).getDay()
              return (
                <div key={d} style={{ width: W }} className={`shrink-0 py-1 text-center ${d === td ? 'font-semibold text-accent' : ''} ${wd === 0 || wd === 6 ? 'bg-app' : ''}`}>
                  <div>{parseYmd(d).getDate()}</div>
                  <div className="text-[9px] opacity-70">{parseYmd(d).getDate() === 1 || d === min ? fmt(d).replace(/^\d+\s*/, '') : ''}</div>
                </div>
              )
            })}
          </div>
          <div className="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-accent/60" style={{ left: LEFT + diffDays(min, td) * W + W / 2 }} />
          {dated.map((i) => {
            const [a, b] = span(i)
            return (
              <div key={i.id} className="flex h-9 items-center border-b border-line last:border-b-0">
                <button type="button" onClick={() => s.setPeek(i.id)} style={{ width: LEFT }}
                  className="sticky left-0 z-20 flex h-full shrink-0 items-center gap-2 truncate border-r border-line bg-surface px-3 text-left text-[13px] hover:bg-hover">
                  <StateIcon state={i.state} /><span className="truncate">{i.title}</span>
                </button>
                <div className="relative h-full flex-1">
                  <button type="button" onClick={() => s.setPeek(i.id)} title={`${project.identifier}-${i.seq} · ${fmt(a)} – ${fmt(b)}`}
                    className="absolute top-1.5 h-6 truncate rounded px-2 text-left text-[11px] font-medium text-white hover:brightness-110"
                    style={{ left: diffDays(min, a) * W + 2, width: (diffDays(a, b) + 1) * W - 4, background: STATE_COLOR[i.state] }}>
                    {diffDays(a, b) >= 2 ? i.title : ''}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {dated.length < items.length && <p className="mt-2 text-xs text-muted">{t('noDates')}</p>}
    </div>
  )
}
