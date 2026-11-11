export type StateKey = 'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled'
export type PriorityKey = 'urgent' | 'high' | 'medium' | 'low' | 'none'
export type Lang = 'id' | 'en'
export type Theme = 'dark' | 'light'
export type Layout = 'list' | 'board' | 'calendar' | 'table' | 'gantt'
export type GroupBy = 'state' | 'priority' | 'cycle' | 'module' | 'none'

export interface Project { id: string; name: string; identifier: string; emoji: string; description: string; seq: number; createdAt: string }
export interface Item {
  id: string; projectId: string; seq: number; title: string; description: string
  state: StateKey; priority: PriorityKey; labelIds: string[]
  startDate: string | null; dueDate: string | null
  parentId: string | null; cycleId: string | null; moduleId: string | null
  createdAt: string; updatedAt: string; completedAt: string | null
}
export interface Label { id: string; projectId: string; name: string; color: string }
export interface Cycle { id: string; projectId: string; name: string; description: string; startDate: string | null; endDate: string | null }
export type ModuleStatus = 'planned' | 'active' | 'paused' | 'completed'
export interface Module { id: string; projectId: string; name: string; description: string; status: ModuleStatus; startDate: string | null; targetDate: string | null }
export interface Filters { states: StateKey[]; priorities: PriorityKey[]; labelIds: string[]; query: string }
export interface SavedView { id: string; projectId: string; name: string; filters: Filters }
export interface Page { id: string; projectId: string; title: string; content: string; updatedAt: string }
export interface Sticky { id: string; content: string; color: string; updatedAt: string }
export interface Display { layout: Layout; groupBy: GroupBy; showSub: boolean; filters: Filters }
