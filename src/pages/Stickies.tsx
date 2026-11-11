import { Plus, StickyNote, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { useT } from '../i18n'
import { STICKY_COLORS } from '../lib'
import { Empty, PageHeader } from '../components/ui'

export function Stickies() {
  const t = useT()
  const s = useStore()
  const add = () => s.add('stickies', { content: '', color: STICKY_COLORS[s.stickies.length % STICKY_COLORS.length], updatedAt: new Date().toISOString() })
  return (
    <div className="flex h-full flex-col">
      <PageHeader crumbs={<><StickyNote size={15} />{t('stickies')}</>} actions={<button type="button" className="btn-primary" onClick={add}><Plus size={14} />{t('newSticky')}</button>} />
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {s.stickies.length === 0 ? (
          <Empty icon={<StickyNote size={32} />} title={t('emptyStickies')} action={<button type="button" className="btn-primary" onClick={add}><Plus size={14} />{t('newSticky')}</button>} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {s.stickies.map((n) => (
              <div key={n.id} className="group flex h-52 flex-col rounded-lg p-3 text-[#2a2410] shadow" style={{ background: n.color }}>
                <textarea aria-label={t('stickies')} value={n.content} placeholder={t('stickyPh')}
                  onChange={(e) => s.upd('stickies', n.id, { content: e.target.value, updatedAt: new Date().toISOString() })}
                  className="min-h-0 flex-1 resize-none bg-transparent text-sm leading-relaxed placeholder:text-black/40 focus:outline-none" />
                <div className="flex items-center gap-1.5 pt-2">
                  {STICKY_COLORS.map((c) => (
                    <button key={c} type="button" aria-label={c} onClick={() => s.upd('stickies', n.id, { color: c })}
                      className={`size-4 rounded-full border ${c === n.color ? 'border-black/60' : 'border-black/15'}`} style={{ background: c }} />
                  ))}
                  <button type="button" className="ml-auto rounded p-1 text-black/50 hover:bg-black/10 hover:text-black" aria-label={t('delete')}
                    onClick={() => (!n.content || window.confirm(t('confirmDelete'))) && s.del('stickies', n.id)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
