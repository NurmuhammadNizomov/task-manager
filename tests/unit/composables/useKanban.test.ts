import { ref, computed, watch } from 'vue'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import type { Task } from '../../../app/composables/useKanban'

// ── Stub Nuxt auto-imports before importing the composable ──────────────────
const mockToastAdd = vi.fn()
vi.stubGlobal('ref', ref)
vi.stubGlobal('computed', computed)
vi.stubGlobal('watch', watch)
vi.stubGlobal('useToast', () => ({ add: mockToastAdd }))
vi.stubGlobal('useI18n', () => ({ t: (k: string) => k }))

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Import AFTER stubs are set
const { useKanban } = await import('../../../app/composables/useKanban')

// ── Helpers ─────────────────────────────────────────────────────────────────
function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    _id: Math.random().toString(36).slice(2),
    title: 'Test task',
    status: 'planned',
    priority: 'medium',
    position: 1,
    project: 'proj-1',
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFetch.mockResolvedValue({ data: [] })
})

// ── columns computed ─────────────────────────────────────────────────────────
describe('useKanban — columns', () => {
  it('groups tasks into correct status columns', async () => {
    mockFetch.mockResolvedValueOnce({
      data: [
        makeTask({ status: 'planned', _id: 'a' }),
        makeTask({ status: 'inProgress', _id: 'b' }),
        makeTask({ status: 'inReview', _id: 'c' }),
        makeTask({ status: 'done', _id: 'd' })
      ]
    })
    const kanban = useKanban('proj-1')
    await kanban.fetchTasks()

    expect(kanban.columns.value.planned).toHaveLength(1)
    expect(kanban.columns.value.inProgress).toHaveLength(1)
    expect(kanban.columns.value.inReview).toHaveLength(1)
    expect(kanban.columns.value.done).toHaveLength(1)
  })

  it('sorts tasks in each column by position ascending', async () => {
    mockFetch.mockResolvedValueOnce({
      data: [
        makeTask({ status: 'planned', position: 3, _id: 'c' }),
        makeTask({ status: 'planned', position: 1, _id: 'a' }),
        makeTask({ status: 'planned', position: 2, _id: 'b' })
      ]
    })
    const kanban = useKanban('proj-1')
    await kanban.fetchTasks()

    const positions = kanban.columns.value.planned.map((t) => t.position)
    expect(positions).toEqual([1, 2, 3])
  })

  it('shows empty arrays for unused statuses', async () => {
    mockFetch.mockResolvedValueOnce({ data: [makeTask({ status: 'done' })] })
    const kanban = useKanban('proj-1')
    await kanban.fetchTasks()

    expect(kanban.columns.value.planned).toHaveLength(0)
    expect(kanban.columns.value.inProgress).toHaveLength(0)
    expect(kanban.columns.value.inReview).toHaveLength(0)
    expect(kanban.columns.value.done).toHaveLength(1)
  })
})

// ── buildParams / fetchTasks params ─────────────────────────────────────────
describe('useKanban — buildParams', () => {
  it('sends empty params when no filters set', async () => {
    const kanban = useKanban('proj-1')
    await kanban.fetchTasks()

    expect(mockFetch).toHaveBeenCalledWith('/api/projects/proj-1/tasks', { params: {} })
  })

  it('includes priority param when filter is set', async () => {
    const kanban = useKanban('proj-1')
    kanban.filterPriority.value = 'high'
    await kanban.fetchTasks()

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/projects/proj-1/tasks',
      { params: { priority: 'high' } }
    )
  })

  it('includes status param when filter is set', async () => {
    const kanban = useKanban('proj-1')
    kanban.filterStatus.value = 'done'
    await kanban.fetchTasks()

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/projects/proj-1/tasks',
      { params: { status: 'done' } }
    )
  })

  it('trims and includes search query', async () => {
    const kanban = useKanban('proj-1')
    kanban.searchQuery.value = '  bug fix  '
    await kanban.fetchTasks()

    const call = mockFetch.mock.calls.at(-1)![1]
    expect(call.params.search).toBe('bug fix')
  })

  it('omits search param when query is blank', async () => {
    const kanban = useKanban('proj-1')
    kanban.searchQuery.value = '   '
    await kanban.fetchTasks()

    const call = mockFetch.mock.calls.at(-1)![1]
    expect(call.params).not.toHaveProperty('search')
  })

  it('combines all active filters', async () => {
    const kanban = useKanban('proj-1')
    kanban.searchQuery.value = 'login'
    kanban.filterPriority.value = 'urgent'
    kanban.filterStatus.value = 'inProgress'
    await kanban.fetchTasks()

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/projects/proj-1/tasks',
      { params: { search: 'login', priority: 'urgent', status: 'inProgress' } }
    )
  })
})

// ── createTask ───────────────────────────────────────────────────────────────
describe('useKanban — createTask', () => {
  it('appends new task to allTasks', async () => {
    const newTask = makeTask({ _id: 'new-1', status: 'planned', position: 1 })
    mockFetch.mockResolvedValueOnce({ data: [] })
    mockFetch.mockResolvedValueOnce({ data: newTask })

    const kanban = useKanban('proj-1')
    await kanban.fetchTasks()
    await kanban.createTask('New task', 'planned')

    expect(kanban.columns.value.planned).toHaveLength(1)
    expect(kanban.columns.value.planned[0]._id).toBe('new-1')
  })

  it('shows error toast when creation fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const kanban = useKanban('proj-1')
    await kanban.createTask('Fail', 'planned')

    expect(mockToastAdd).toHaveBeenCalledWith(expect.objectContaining({ color: 'error' }))
  })
})

// ── deleteTask ───────────────────────────────────────────────────────────────
describe('useKanban — deleteTask', () => {
  it('removes task from allTasks after delete', async () => {
    const task = makeTask({ _id: 'del-1', status: 'planned' })
    mockFetch.mockResolvedValueOnce({ data: [task] })
    mockFetch.mockResolvedValueOnce(undefined) // DELETE response

    const kanban = useKanban('proj-1')
    await kanban.fetchTasks()
    expect(kanban.allTasks.value).toHaveLength(1)

    await kanban.deleteTask('del-1')
    expect(kanban.allTasks.value).toHaveLength(0)
  })
})
