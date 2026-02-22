import { useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  Wrench,
  Plus,
  X,
  Save,
  Trash2,
  Package,
  Truck,
  MessageSquare,
  AlertCircle,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { ScheduleEvent } from '@/types/database'

type RepairStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
type ScheduleEventType = ScheduleEvent['event_type']
type ScheduleEventStatus = ScheduleEvent['status']

interface ScheduleRepairItem {
  id: string
  customer_name: string
  controller_model: string
  controller_models?: {
    model_name: string
  } | null
  status: RepairStatus
  total_amount: number
  created_at: string
  estimated_completion_date: string | null
}

interface CalendarEventItem {
  id: string
  title: string
  dateKey: string
  source: 'schedule' | 'repair'
  badgeClass: string
  summary: string
  raw: ScheduleEvent | ScheduleRepairItem
}

interface ScheduleFormState {
  title: string
  eventType: ScheduleEventType
  status: ScheduleEventStatus
  startAt: string
  endAt: string
  assignee: string
  memo: string
  repairRequestId: string
}

const repairStatusLabel: Record<RepairStatus, string> = {
  pending: '접수 대기',
  confirmed: '접수 확인',
  in_progress: '수리 진행',
  completed: '수리 완료',
  cancelled: '취소',
}

const repairStatusClass: Record<RepairStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const eventTypeLabel: Record<ScheduleEventType, string> = {
  repair: '수리',
  purchase: '발주',
  shipping: '배송',
  customer_support: '고객응대',
  other: '기타',
}

const eventStatusLabel: Record<ScheduleEventStatus, string> = {
  scheduled: '예정',
  in_progress: '진행중',
  delayed: '지연',
  completed: '완료',
  cancelled: '취소',
}

const eventTypeClass: Record<ScheduleEventType, string> = {
  repair: 'bg-indigo-100 text-indigo-800',
  purchase: 'bg-amber-100 text-amber-800',
  shipping: 'bg-cyan-100 text-cyan-800',
  customer_support: 'bg-violet-100 text-violet-800',
  other: 'bg-gray-100 text-gray-800',
}

const eventStatusClass: Record<ScheduleEventStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  delayed: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-200 text-gray-700',
}

const toDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatMonthTitle = (date: Date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`

const toInputDateTime = (iso: string | null) => {
  if (!iso) return ''
  const date = new Date(iso)
  const tzOffsetMs = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16)
}

const toIsoString = (input: string) => {
  if (!input) return null
  return new Date(input).toISOString()
}

const defaultFormState = (): ScheduleFormState => ({
  title: '',
  eventType: 'other',
  status: 'scheduled',
  startAt: toInputDateTime(new Date().toISOString()),
  endAt: '',
  assignee: '',
  memo: '',
  repairRequestId: '',
})

const isScheduleTableMissing = (error: unknown) => {
  if (!error || typeof error !== 'object') return false
  const message = String((error as { message?: string }).message || '')
  const details = String((error as { details?: string }).details || '')
  const code = String((error as { code?: string }).code || '')
  return (
    code === '42P01' ||
    message.includes('schedule_events') ||
    message.includes('relation') ||
    details.includes('schedule_events')
  )
}

export function SchedulePage() {
  const navigate = useNavigate()
  const [repairs, setRepairs] = useState<ScheduleRepairItem[]>([])
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(new Date()))
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [formState, setFormState] = useState<ScheduleFormState>(defaultFormState())

  useEffect(() => {
    const loadScheduleData = async () => {
      setLoading(true)
      try {
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const monthEnd = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1,
          0,
          23,
          59,
          59
        )

        const [repairsRes, scheduleRes] = await Promise.all([
          supabase
            .from('repair_requests')
            .select(
              `id, customer_name, controller_model, status, total_amount, created_at, estimated_completion_date,
               controller_models!repair_requests_controller_model_fkey(model_name)`
            )
            .or(
              `and(created_at.gte.${monthStart.toISOString()},created_at.lte.${monthEnd.toISOString()}),and(estimated_completion_date.gte.${monthStart.toISOString()},estimated_completion_date.lte.${monthEnd.toISOString()})`
            )
            .order('created_at', { ascending: true }),
          supabase
            .from('schedule_events')
            .select('*')
            .gte('start_at', monthStart.toISOString())
            .lte('start_at', monthEnd.toISOString())
            .order('start_at', { ascending: true }),
        ])

        if (repairsRes.error) throw repairsRes.error

        if (scheduleRes.error) {
          if (isScheduleTableMissing(scheduleRes.error)) {
            console.warn(
              'schedule_events table is missing. Showing repair-only calendar.',
              scheduleRes.error
            )
            setScheduleEvents([])
            toast.error('일정 테이블이 아직 생성되지 않았습니다. 마이그레이션 037을 실행해 주세요.')
          } else {
            throw scheduleRes.error
          }
        } else {
          setScheduleEvents((scheduleRes.data || []) as ScheduleEvent[])
        }

        setRepairs((repairsRes.data || []) as ScheduleRepairItem[])
      } catch (error) {
        console.error('Failed to load schedule data:', error)
        toast.error('일정 데이터를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadScheduleData()
  }, [currentMonth])

  const monthCells = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const firstWeekday = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const cells: Array<{ date: Date; inCurrentMonth: boolean }> = []

    for (let i = firstWeekday - 1; i >= 0; i -= 1) {
      cells.push({ date: new Date(year, month, -i), inCurrentMonth: false })
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ date: new Date(year, month, day), inCurrentMonth: true })
    }

    while (cells.length % 7 !== 0) {
      const date = new Date(year, month + 1, cells.length - (firstWeekday + daysInMonth) + 1)
      cells.push({ date, inCurrentMonth: false })
    }

    return cells
  }, [currentMonth])

  const calendarEventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEventItem[]>()

    scheduleEvents.forEach((event) => {
      const key = toDateKey(new Date(event.start_at))
      const item: CalendarEventItem = {
        id: `schedule-${event.id}`,
        title: event.title,
        dateKey: key,
        source: 'schedule',
        badgeClass: eventTypeClass[event.event_type],
        summary: `${eventTypeLabel[event.event_type]} · ${eventStatusLabel[event.status]}`,
        raw: event,
      }
      if (!map.has(key)) map.set(key, [])
      map.get(key)?.push(item)
    })

    repairs.forEach((repair) => {
      const createdKey = toDateKey(new Date(repair.created_at))
      const createdItem: CalendarEventItem = {
        id: `repair-created-${repair.id}`,
        title: `${repair.customer_name} 접수`,
        dateKey: createdKey,
        source: 'repair',
        badgeClass: repairStatusClass[repair.status],
        summary: `수리신청 · ${repairStatusLabel[repair.status]}`,
        raw: repair,
      }
      if (!map.has(createdKey)) map.set(createdKey, [])
      map.get(createdKey)?.push(createdItem)

      if (repair.estimated_completion_date) {
        const dueKey = toDateKey(new Date(repair.estimated_completion_date))
        if (dueKey !== createdKey) {
          const dueItem: CalendarEventItem = {
            id: `repair-due-${repair.id}`,
            title: `${repair.customer_name} 완료예정`,
            dateKey: dueKey,
            source: 'repair',
            badgeClass: 'bg-emerald-100 text-emerald-800',
            summary: '완료예정',
            raw: repair,
          }
          if (!map.has(dueKey)) map.set(dueKey, [])
          map.get(dueKey)?.push(dueItem)
        }
      }
    })

    map.forEach((items, key) => {
      map.set(
        key,
        items.sort((a, b) => {
          if (a.source === b.source) return a.title.localeCompare(b.title)
          return a.source === 'schedule' ? -1 : 1
        })
      )
    })

    return map
  }, [repairs, scheduleEvents])

  const selectedDateEvents = calendarEventsByDate.get(selectedDateKey) || []

  const repairOptions = useMemo(
    () =>
      repairs
        .slice()
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map((repair) => ({
          id: repair.id,
          label: `${repair.customer_name} · ${repair.controller_model}`,
        })),
    [repairs]
  )

  const moveMonth = (offset: number) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1))
  }

  const openCreateModal = () => {
    setEditingEventId(null)
    setFormState(defaultFormState())
    setIsModalOpen(true)
  }

  const openEditModal = (event: ScheduleEvent) => {
    setEditingEventId(event.id)
    setFormState({
      title: event.title,
      eventType: event.event_type,
      status: event.status,
      startAt: toInputDateTime(event.start_at),
      endAt: toInputDateTime(event.end_at),
      assignee: event.assignee || '',
      memo: event.memo || '',
      repairRequestId: event.repair_request_id || '',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingEventId(null)
    setFormState(defaultFormState())
  }

  const saveEvent = async () => {
    if (!formState.title.trim()) {
      toast.error('일정 제목을 입력해 주세요.')
      return
    }
    if (!formState.startAt) {
      toast.error('시작 일시를 입력해 주세요.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        title: formState.title.trim(),
        event_type: formState.eventType,
        status: formState.status,
        start_at: toIsoString(formState.startAt),
        end_at: toIsoString(formState.endAt),
        assignee: formState.assignee.trim() || null,
        memo: formState.memo.trim() || null,
        repair_request_id: formState.repairRequestId || null,
      }

      if (editingEventId) {
        const { data, error } = await supabase
          .from('schedule_events')
          .update(payload)
          .eq('id', editingEventId)
          .select('*')
          .single()

        if (error) throw error
        setScheduleEvents((prev) =>
          prev.map((event) => (event.id === editingEventId ? data : event))
        )
        toast.success('일정을 수정했습니다.')
      } else {
        const { data, error } = await supabase
          .from('schedule_events')
          .insert(payload)
          .select('*')
          .single()

        if (error) throw error
        setScheduleEvents((prev) => [data, ...prev])
        toast.success('일정을 등록했습니다.')
      }

      closeModal()
    } catch (error) {
      console.error('Failed to save schedule event:', error)
      if (isScheduleTableMissing(error)) {
        toast.error('일정 테이블이 없어 저장할 수 없습니다. 마이그레이션 037을 먼저 실행해 주세요.')
      } else {
        toast.error('일정을 저장하지 못했습니다.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const deleteEvent = async () => {
    if (!editingEventId) return

    setSubmitting(true)
    try {
      const { error } = await supabase.from('schedule_events').delete().eq('id', editingEventId)
      if (error) throw error

      setScheduleEvents((prev) => prev.filter((event) => event.id !== editingEventId))
      toast.success('일정을 삭제했습니다.')
      closeModal()
    } catch (error) {
      console.error('Failed to delete schedule event:', error)
      if (isScheduleTableMissing(error)) {
        toast.error('일정 테이블이 없어 삭제할 수 없습니다. 마이그레이션 037을 먼저 실행해 주세요.')
      } else {
        toast.error('일정을 삭제하지 못했습니다.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const renderEventTypeIcon = (type: ScheduleEventType) => {
    switch (type) {
      case 'purchase':
        return <Package className="w-4 h-4" />
      case 'shipping':
        return <Truck className="w-4 h-4" />
      case 'customer_support':
        return <MessageSquare className="w-4 h-4" />
      case 'repair':
        return <Wrench className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">일정 관리</h1>
          <p className="text-sm text-gray-600 mt-1">
            발주, 배송, 수리, 고객응대 일정을 등록하고 조정할 수 있습니다.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          일정 등록
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => moveMonth(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="이전 달"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">{formatMonthTitle(currentMonth)}</h2>
            <button
              onClick={() => moveMonth(1)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="다음 달"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {monthCells.map(({ date, inCurrentMonth }) => {
                const dateKey = toDateKey(date)
                const dayEvents = calendarEventsByDate.get(dateKey) || []
                const isSelected = selectedDateKey === dateKey
                const isToday = toDateKey(new Date()) === dateKey

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDateKey(dateKey)}
                    className={`h-28 rounded-lg border p-2 text-left transition ${
                      isSelected
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    } ${!inCurrentMonth ? 'opacity-40' : ''}`}
                  >
                    <div
                      className={`text-sm mb-1 ${isToday ? 'font-bold text-blue-600' : 'text-gray-900'}`}
                    >
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-[11px] px-1.5 py-0.5 rounded truncate ${event.badgeClass}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[11px] text-gray-500">+{dayEvents.length - 2}건</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold">선택 날짜 일정</h3>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {selectedDateKey.replace(/-/g, '.')} 일정 {selectedDateEvents.length}건
          </p>

          {selectedDateEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>등록된 일정이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateEvents.map((event) => {
                if (event.source === 'schedule') {
                  const row = event.raw as ScheduleEvent
                  return (
                    <button
                      key={event.id}
                      onClick={() => openEditModal(row)}
                      className="w-full text-left rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {renderEventTypeIcon(row.event_type)}
                          <p className="font-semibold text-gray-900">{row.title}</p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${eventStatusClass[row.status]}`}
                        >
                          {eventStatusLabel[row.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {eventTypeLabel[row.event_type]} 일정
                      </p>
                      {row.assignee && (
                        <p className="text-xs text-gray-500">담당: {row.assignee}</p>
                      )}
                    </button>
                  )
                }

                const repair = event.raw as ScheduleRepairItem
                return (
                  <button
                    key={event.id}
                    onClick={() => navigate('/admin/repairs')}
                    className="w-full text-left rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900">{event.title}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${repairStatusClass[repair.status]}`}
                      >
                        {repairStatusLabel[repair.status]}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Wrench className="w-4 h-4" />
                      <span className="truncate">
                        {repair.controller_models?.model_name || repair.controller_model}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      예상 금액: ₩{(repair.total_amount || 0).toLocaleString()}
                    </p>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold">{editingEventId ? '일정 수정' : '일정 등록'}</h3>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">제목</label>
                <input
                  value={formState.title}
                  onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="예: 부품 발주 확인"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">유형</label>
                <select
                  value={formState.eventType}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      eventType: e.target.value as ScheduleEventType,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {(Object.keys(eventTypeLabel) as ScheduleEventType[]).map((type) => (
                    <option key={type} value={type}>
                      {eventTypeLabel[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">상태</label>
                <select
                  value={formState.status}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      status: e.target.value as ScheduleEventStatus,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {(Object.keys(eventStatusLabel) as ScheduleEventStatus[]).map((status) => (
                    <option key={status} value={status}>
                      {eventStatusLabel[status]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">시작 일시</label>
                <input
                  type="datetime-local"
                  value={formState.startAt}
                  onChange={(e) => setFormState((prev) => ({ ...prev, startAt: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">종료 일시 (선택)</label>
                <input
                  type="datetime-local"
                  value={formState.endAt}
                  onChange={(e) => setFormState((prev) => ({ ...prev, endAt: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">담당자</label>
                <input
                  value={formState.assignee}
                  onChange={(e) => setFormState((prev) => ({ ...prev, assignee: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="예: 김OO"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">연결 수리건 (선택)</label>
                <select
                  value={formState.repairRequestId}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, repairRequestId: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">선택 안 함</option>
                  {repairOptions.map((repair) => (
                    <option key={repair.id} value={repair.id}>
                      {repair.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">메모</label>
                <textarea
                  value={formState.memo}
                  onChange={(e) => setFormState((prev) => ({ ...prev, memo: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[96px]"
                  placeholder="세부 진행사항, 체크포인트를 입력하세요."
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div>
                {editingEventId && (
                  <button
                    onClick={deleteEvent}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-60"
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-60"
                >
                  취소
                </button>
                <button
                  onClick={saveEvent}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:opacity-90 transition disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {editingEventId ? '수정 저장' : '등록 저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
