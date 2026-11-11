import { useState } from 'react'
import { NavLink, useParams, useMatch } from 'react-router-dom'
import { Boxes, Briefcase, ChartColumn, ChevronDown, ChevronRight, FileText, Home, Layers, List, Plus, RefreshCw, Settings, StickyNote } from 'lucide-react'
import { useStore } from '../store'
import { useT, type TKey } from '../i18n'

const link = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] ${isActive ? 'bg-hover font-medium text-fg' : 'text-muted hover:bg-hover hover:text-fg'}`

const SUB: [string, TKey, typeof List][] = [
  ['items', 'workItems', List], ['cycles', 'cycles', RefreshCw], ['modules', 'modules', Boxes],
  ['views', 'views', Layers], ['pages', 'pages', FileText], ['analytics', 'analytics', ChartColumn],
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT()
  const projects = useStore((s) => s.projects)
  const openCreate = useStore((s) => s.openCreate)
  const active = useMatch('/p/:pid/*')?.params.pid
  useParams()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const target = active ?? projects[0]?.id
  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={onClose} />}
      <nav aria-label={t('menu')}
        className={`${open ? 'fixed inset-y-0 left-0 z-30 flex shadow-2xl' : 'hidden'} w-60 shrink-0 flex-col overflow-y-auto border border-line bg-surface p-2 md:static md:flex md:rounded-lg md:shadow-none`}>
        <button type="button" className="btn mb-2 w-full justify-start" disabled={!target} onClick={() => target && openCreate(target)}>
          <Plus size={14} />{t('newWorkItem')}
        </button>
        <NavLink to="/" end className={link}><Home size={15} />{t('home')}</NavLink>
        <NavLink to="/stickies" className={link}><StickyNote size={15} />{t('stickies')}</NavLink>
        <div className="mt-4 px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{t('workspace')}</div>
        <NavLink to="/projects" className={link}><Briefcase size={15} />{t('projects')}</NavLink>
        <NavLink to="/settings" className={link}><Settings size={15} />{t('settings')}</NavLink>
        <div className="mt-4 px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{t('projects')}</div>
        {projects.map((p) => {
          const isOpen = !(collapsed[p.id] ?? (projects.length > 3 && active !== p.id))
          return (
            <div key={p.id}>
              <button type="button" aria-expanded={isOpen} onClick={() => setCollapsed((c) => ({ ...c, [p.id]: isOpen }))}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] font-medium hover:bg-hover">
                <span>{p.emoji}</span><span className="min-w-0 flex-1 truncate">{p.name}</span>
                {isOpen ? <ChevronDown size={14} className="text-muted" /> : <ChevronRight size={14} className="text-muted" />}
              </button>
              {isOpen && (
                <div className="ml-4 border-l border-line pl-2">
                  {SUB.map(([path, key, I]) => (
                    <NavLink key={path} to={`/p/${p.id}/${path}`} className={link}><I size={14} />{t(key)}</NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        {projects.length === 0 && <NavLink to="/projects" className={link}><Plus size={14} />{t('newProject')}</NavLink>}
      </nav>
    </>
  )
}
