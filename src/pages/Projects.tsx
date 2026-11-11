import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Pencil, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { useT } from '../i18n'
import { Empty, Field, Modal, PageHeader } from '../components/ui'
import type { Project } from '../types'

type Draft = Pick<Project, 'name' | 'identifier' | 'emoji' | 'description'> & { id?: string }
const blank: Draft = { name: '', identifier: '', emoji: '📁', description: '' }
const autoKey = (name: string) => name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()

export function Projects() {
  const t = useT()
  const s = useStore()
  const [d, setD] = useState<Draft | null>(null)
  const save = () => {
    if (!d || !d.name.trim()) return
    const row = { name: d.name.trim(), identifier: (d.identifier || autoKey(d.name) || 'PRJ').toUpperCase(), emoji: d.emoji || '📁', description: d.description }
    if (d.id) s.upd('projects', d.id, row)
    else s.addProject(row)
    setD(null)
  }
  const newBtn = <button type="button" className="btn-primary" onClick={() => setD(blank)}><Plus size={14} />{t('newProject')}</button>
  return (
    <div className="flex h-full flex-col">
      <PageHeader crumbs={<><Briefcase size={15} />{t('projects')}</>} actions={newBtn} />
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {s.projects.length === 0 ? <Empty icon={<Briefcase size={32} />} title={t('emptyProjects')} action={newBtn} /> : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {s.projects.map((p) => {
              const n = s.items.filter((i) => i.projectId === p.id).length
              return (
                <div key={p.id} className="card flex flex-col p-4">
                  <Link to={`/p/${p.id}/items`} className="flex items-center gap-2 font-medium hover:text-accent">
                    <span className="text-lg">{p.emoji}</span><span className="truncate">{p.name}</span>
                    <span className="ml-auto rounded bg-hover px-1.5 py-0.5 text-[11px] text-muted">{p.identifier}</span>
                  </Link>
                  <p className="mt-1 line-clamp-2 min-h-9 text-[13px] text-muted">{p.description}</p>
                  <div className="mt-2 flex items-center text-xs text-muted">
                    {n} {t('items')}
                    <button type="button" className="btn-ghost ml-auto" aria-label={t('edit')} onClick={() => setD(p)}><Pencil size={14} /></button>
                    <button type="button" className="btn-ghost hover:!text-danger" aria-label={t('delete')} onClick={() => window.confirm(t('confirmDeleteProject')) && s.delProject(p.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {d && (
        <Modal title={d.id ? t('edit') : t('newProject')} onClose={() => setD(null)}
          footer={<><button type="button" className="btn" onClick={() => setD(null)}>{t('cancel')}</button><button type="button" className="btn-primary" disabled={!d.name.trim()} onClick={save}>{t('save')}</button></>}>
          <div className="flex gap-3">
            <div className="w-16"><Field label={t('emoji')}><input className="input text-center" maxLength={4} value={d.emoji} onChange={(e) => setD({ ...d, emoji: e.target.value })} /></Field></div>
            <div className="flex-1"><Field label={t('name')}><input autoFocus className="input" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && save()} /></Field></div>
            <div className="w-24"><Field label={t('identifier')}><input className="input uppercase" maxLength={5} placeholder={autoKey(d.name) || 'PRJ'} value={d.identifier} onChange={(e) => setD({ ...d, identifier: e.target.value.replace(/[^a-zA-Z0-9]/g, '') })} /></Field></div>
          </div>
          <Field label={t('description')}><textarea className="input min-h-20" value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} /></Field>
        </Modal>
      )}
    </div>
  )
}
