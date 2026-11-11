import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_DISPLAY, today, addDays, uid } from './lib'
import type { Cycle, Display, Item, Label, Lang, Module, Page, Project, SavedView, Sticky, Theme } from './types'

export interface Data {
  projects: Project[]; items: Item[]; labels: Label[]; cycles: Cycle[]; modules: Module[]
  views: SavedView[]; pages: Page[]; stickies: Sticky[]
}
type CKey = keyof Data
type Row<K extends CKey> = Data[K][number]
export const DATA_KEYS: CKey[] = ['projects', 'items', 'labels', 'cycles', 'modules', 'views', 'pages', 'stickies']

interface State extends Data {
  lang: Lang; theme: Theme; display: Record<string, Display>
  // UI sementara (tidak disimpan)
  peekId: string | null
  createFor: { projectId: string; preset: Partial<Item> } | null
  setLang: (l: Lang) => void
  setTheme: (t: Theme) => void
  setDisplay: (key: string, patch: Partial<Display>) => void
  setPeek: (id: string | null) => void
  openCreate: (projectId: string, preset?: Partial<Item>) => void
  closeCreate: () => void
  add: <K extends Exclude<CKey, 'items' | 'projects'>>(k: K, row: Omit<Row<K>, 'id'>) => string
  upd: <K extends CKey>(k: K, id: string, patch: Partial<Row<K>>) => void
  del: (k: Exclude<CKey, 'projects' | 'items'>, id: string) => void
  addProject: (p: Pick<Project, 'name' | 'identifier' | 'emoji' | 'description'>) => string
  delProject: (id: string) => void
  addItem: (projectId: string, patch: Partial<Item> & { title: string }) => string
  updItem: (id: string, patch: Partial<Item>) => void
  delItem: (id: string) => void
  importData: (d: Data) => void
  resetData: () => void
}

const now = () => new Date().toISOString()

function seed(): Data {
  const pid = uid(), t = today(), c1 = uid(), m1 = uid(), l1 = uid(), l2 = uid()
  const mk = (seq: number, title: string, p: Partial<Item>): Item => ({
    id: uid(), projectId: pid, seq, title, description: '', state: 'backlog', priority: 'none', labelIds: [],
    startDate: null, dueDate: null, parentId: null, cycleId: null, moduleId: null,
    createdAt: now(), updatedAt: now(), completedAt: null, ...p,
  })
  return {
    projects: [{ id: pid, name: 'Proyek Pertama', identifier: 'CTT', emoji: '📒', description: 'Proyek contoh. Ubah atau hapus sesukamu.', seq: 6, createdAt: now() }],
    items: [
      mk(1, 'Selamat datang di Catatan 👋', { state: 'done', priority: 'high', completedAt: now(), cycleId: c1, description: 'Klik item mana pun untuk membuka panel detail. Semua data tersimpan di perangkat ini.' }),
      mk(2, 'Buat item pekerjaan pertamamu', { state: 'todo', priority: 'high', dueDate: addDays(t, 1), cycleId: c1, labelIds: [l1] }),
      mk(3, 'Coba tampilan Papan, Kalender, Tabel, dan Linimasa', { state: 'in_progress', priority: 'medium', startDate: t, dueDate: addDays(t, 3), cycleId: c1, moduleId: m1 }),
      mk(4, 'Kelompokkan pekerjaan ke dalam Siklus', { state: 'backlog', priority: 'low', startDate: addDays(t, 2), dueDate: addDays(t, 6), moduleId: m1 }),
      mk(5, 'Tulis catatan proyek di Halaman', { state: 'backlog', labelIds: [l2] }),
      mk(6, 'Ganti bahasa dan tema di Pengaturan', { state: 'backlog', priority: 'low' }),
    ],
    labels: [{ id: l1, projectId: pid, name: 'Penting', color: '#e5534b' }, { id: l2, projectId: pid, name: 'Dokumentasi', color: '#5b9cf5' }],
    cycles: [{ id: c1, projectId: pid, name: 'Siklus 1 — Mulai', description: '', startDate: addDays(t, -1), endDate: addDays(t, 12) }],
    modules: [{ id: m1, projectId: pid, name: 'Pengenalan', description: '', status: 'active', startDate: t, targetDate: addDays(t, 14) }],
    views: [], pages: [{ id: uid(), projectId: pid, title: 'Catatan proyek', content: 'Tulis rencana, notulen, atau referensi di sini.', updatedAt: now() }],
    stickies: [{ id: uid(), content: 'Ide cepat? Tempel di sini.', color: '#f5d76e', updatedAt: now() }],
  }
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      ...seed(),
      lang: 'id', theme: 'dark', display: {}, peekId: null, createFor: null,
      setLang: (lang) => set({ lang }),
      setTheme: (theme) => set({ theme }),
      setDisplay: (key, patch) =>
        set((s) => ({ display: { ...s.display, [key]: { ...(s.display[key] ?? DEFAULT_DISPLAY), ...patch } } })),
      setPeek: (peekId) => set({ peekId }),
      openCreate: (projectId, preset = {}) => set({ createFor: { projectId, preset } }),
      closeCreate: () => set({ createFor: null }),
      add: (k, row) => {
        const id = uid()
        set((s) => ({ [k]: [...s[k], { ...row, id }] }) as Partial<State>)
        return id
      },
      upd: (k, id, patch) =>
        set((s) => ({ [k]: (s[k] as { id: string }[]).map((r) => (r.id === id ? { ...r, ...patch } : r)) }) as Partial<State>),
      del: (k, id) =>
        set((s) => {
          const out: Partial<State> = { [k]: (s[k] as { id: string }[]).filter((r) => r.id !== id) } as Partial<State>
          // Lepas rujukan dari item supaya tidak ada id yatim.
          if (k === 'cycles') out.items = s.items.map((i) => (i.cycleId === id ? { ...i, cycleId: null } : i))
          if (k === 'modules') out.items = s.items.map((i) => (i.moduleId === id ? { ...i, moduleId: null } : i))
          if (k === 'labels') out.items = s.items.map((i) => (i.labelIds.includes(id) ? { ...i, labelIds: i.labelIds.filter((l) => l !== id) } : i))
          return out
        }),
      addProject: (p) => {
        const id = uid()
        set((s) => ({ projects: [...s.projects, { ...p, id, seq: 0, createdAt: now() }] }))
        return id
      },
      delProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          items: s.items.filter((r) => r.projectId !== id),
          labels: s.labels.filter((r) => r.projectId !== id),
          cycles: s.cycles.filter((r) => r.projectId !== id),
          modules: s.modules.filter((r) => r.projectId !== id),
          views: s.views.filter((r) => r.projectId !== id),
          pages: s.pages.filter((r) => r.projectId !== id),
        })),
      addItem: (projectId, patch) => {
        const id = uid()
        set((s) => {
          const project = s.projects.find((p) => p.id === projectId)
          if (!project) return {}
          const seq = project.seq + 1
          const item: Item = {
            id, projectId, seq, description: '', state: 'backlog', priority: 'none', labelIds: [],
            startDate: null, dueDate: null, parentId: null, cycleId: null, moduleId: null,
            createdAt: now(), updatedAt: now(), completedAt: null, ...patch,
          }
          if (item.state === 'done') item.completedAt = now()
          return { items: [...s.items, item], projects: s.projects.map((p) => (p.id === projectId ? { ...p, seq } : p)) }
        })
        return id
      },
      updItem: (id, patch) =>
        set((s) => ({
          items: s.items.map((i) => {
            if (i.id !== id) return i
            const next = { ...i, ...patch, updatedAt: now() }
            if (patch.state && patch.state !== i.state) next.completedAt = patch.state === 'done' ? now() : null
            return next
          }),
        })),
      delItem: (id) =>
        set((s) => ({
          items: s.items.filter((i) => i.id !== id).map((i) => (i.parentId === id ? { ...i, parentId: null } : i)),
          peekId: s.peekId === id ? null : s.peekId,
        })),
      importData: (d) => set({ ...d, display: {}, peekId: null }),
      resetData: () =>
        set({ projects: [], items: [], labels: [], cycles: [], modules: [], views: [], pages: [], stickies: [], display: {}, peekId: null }),
    }),
    {
      name: 'catatan-v1',
      version: 1,
      partialize: ({ peekId: _p, createFor: _c, ...rest }) => rest,
    },
  ),
)

export const itemKey = (projects: Project[], i: Item) =>
  `${projects.find((p) => p.id === i.projectId)?.identifier ?? '?'}-${i.seq}`
