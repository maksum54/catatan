import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { useFmtDate, useT } from '../i18n'
import { addDays, isOpen, isOverdue, today } from '../lib'
import { Empty, StateIcon } from '../components/ui'
import type { Item } from '../types'

export function Home() {
  const t = useT()
  const fmt = useFmtDate()
  const s = useStore()
  const h = new Date().getHours()
  const greet = h < 11 ? t('greetMorning') : h < 18 ? t('greetAfternoon') : t('greetEvening')
  const open = s.items.filter(isOpen)
  const soonLimit = addDays(today(), 7)
  const due = open.filter((i) => i.dueDate && i.dueDate <= soonLimit).sort((a, b) => a.dueDate!.localeCompare(b.dueDate!)).slice(0, 8)
  const recent = [...s.items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8)
  const key = (i: Item) => `${s.projects.find((p) => p.id === i.projectId)?.identifier}-${i.seq}`
  const stats: [string, number, string?][] = [
    [t('open'), open.length], [t('state.in_progress'), s.items.filter((i) => i.state === 'in_progress').length],
    [t('overdue'), s.items.filter(isOverdue).length, 'text-danger'], [t('state.done'), s.items.filter((i) => i.state === 'done').length],
  ]
  const Row = ({ i, date }: { i: Item; date?: boolean }) => (
    <button type="button" onClick={() => s.setPeek(i.id)} className="flex w-full items-center gap-2 border-t border-line px-3 py-2 text-left text-[13px] hover:bg-hover">
      <StateIcon state={i.state} /><span className="w-16 shrink-0 text-xs text-muted">{key(i)}</span>
      <span className="min-w-0 flex-1 truncate">{i.title}</span>
      {date && <span className={`text-xs ${isOverdue(i) ? 'text-danger' : 'text-muted'}`}>{fmt(i.dueDate)}</span>}
    </button>
  )
  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="mx-auto max-w-4xl space-y-5">
        <div>
          <h1 className="text-xl font-semibold">{greet} 👋</h1>
          <p className="text-[13px] text-muted">{new Date().toLocaleDateString(s.lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(([label, n, cls]) => (
            <div key={label} className="card p-3">
              <div className="text-xs text-muted">{label}</div>
              <div className={`text-2xl font-semibold ${n > 0 && cls ? cls : ''}`}>{n}</div>
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <section className="card overflow-hidden">
            <h2 className="px-3 py-2 text-[13px] font-semibold">{t('dueSoon')}</h2>
            {due.length ? due.map((i) => <Row key={i.id} i={i} date />) : <div className="border-t border-line px-3 py-6 text-center text-[13px] text-muted">{t('nothingDue')}</div>}
          </section>
          <section className="card overflow-hidden">
            <h2 className="px-3 py-2 text-[13px] font-semibold">{t('recent')}</h2>
            {recent.length ? recent.map((i) => <Row key={i.id} i={i} />) : <div className="border-t border-line px-3 py-6 text-center text-[13px] text-muted">{t('emptyItems')}</div>}
          </section>
        </div>
        <section>
          <h2 className="mb-2 text-[13px] font-semibold">{t('projects')}</h2>
          {s.projects.length === 0 ? (
            <Empty title={t('emptyProjects')} action={<Link to="/projects" className="btn-primary">{t('newProject')}</Link>} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {s.projects.map((p) => {
                const its = s.items.filter((i) => i.projectId === p.id)
                return (
                  <Link key={p.id} to={`/p/${p.id}/items`} className="card block p-3 hover:border-muted">
                    <div className="flex items-center gap-2 font-medium"><span>{p.emoji}</span><span className="truncate">{p.name}</span></div>
                    <div className="mt-1 text-xs text-muted">{its.filter(isOpen).length} {t('open').toLowerCase()} · {its.length} {t('items')}</div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
