import type { Display, Filters, Item, PriorityKey, StateKey } from './types'

export const STATES: StateKey[] = ['backlog', 'todo', 'in_progress', 'done', 'cancelled']
export const PRIORITIES: PriorityKey[] = ['urgent', 'high', 'medium', 'low', 'none']
export const STATE_COLOR: Record<StateKey, string> = {
  backlog: '#8b93a1', todo: '#5b9cf5', in_progress: '#f0a020', done: '#2fb56a', cancelled: '#e5534b',
}
export const PRIORITY_COLOR: Record<PriorityKey, string> = {
  urgent: '#e5534b', high: '#f0803c', medium: '#f0a020', low: '#5b9cf5', none: '#8b93a1',
}
export const LABEL_COLORS = ['#e5534b', '#f0803c', '#f0a020', '#2fb56a', '#22a8b8', '#5b9cf5', '#8b6cf0', '#d85fa8']
export const STICKY_COLORS = ['#f5d76e', '#f7a8a8', '#a8d8f7', '#b5e8b0', '#d7b8f5', '#f7c79a']

export const EMPTY_FILTERS: Filters = { states: [], priorities: [], labelIds: [], query: '' }
export const DEFAULT_DISPLAY: Display = { layout: 'list', groupBy: 'state', showSub: true, filters: EMPTY_FILTERS }

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
export const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const today = () => ymd(new Date())
export const parseYmd = (s: string) => new Date(s + 'T00:00:00')
export const addDays = (s: string, n: number) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d) }
export const diffDays = (a: string, b: string) => Math.round((parseYmd(b).getTime() - parseYmd(a).getTime()) / 86400000)

export function applyFilters(items: Item[], f: Filters): Item[] {
  const q = f.query.trim().toLowerCase()
  return items.filter(
    (i) =>
      (!f.states.length || f.states.includes(i.state)) &&
      (!f.priorities.length || f.priorities.includes(i.priority)) &&
      (!f.labelIds.length || f.labelIds.some((l) => i.labelIds.includes(l))) &&
      (!q || i.title.toLowerCase().includes(q)),
  )
}
export const filterCount = (f: Filters) => f.states.length + f.priorities.length + f.labelIds.length + (f.query ? 1 : 0)
export const isOpen = (i: Item) => i.state !== 'done' && i.state !== 'cancelled'
export const isOverdue = (i: Item) => !!i.dueDate && isOpen(i) && i.dueDate < today()
export const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
