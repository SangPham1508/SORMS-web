"use client";

import { useEffect, useMemo, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'

type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

type StaffTask = {
  id: number
  title: string
  assignee: string
  due_date?: string
  priority: TaskPriority
  status: TaskStatus
  description?: string
  created_at: string
}

const mock: StaffTask[] = [
  { id: 1, title: 'Dọn phòng A101', assignee: 'Nguyễn Văn A', due_date: '2025-10-20', priority: 'MEDIUM', status: 'IN_PROGRESS', created_at: '2025-10-18T09:00:00' },
  { id: 2, title: 'Sửa điều hòa B201', assignee: 'Trần Thị B', due_date: '2025-10-21', priority: 'HIGH', status: 'TODO', created_at: '2025-10-18T11:30:00' },
  { id: 3, title: 'Thay bóng đèn C301', assignee: 'Lê Văn C', due_date: '2025-10-19', priority: 'LOW', status: 'DONE', created_at: '2025-10-17T15:10:00' },
]

export default function TasksPage() {
  const [rows, setRows] = useState<StaffTask[]>(mock)
  const [flash, setFlash] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [query, setQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<'ALL' | TaskStatus>('ALL')
  const [sortKey, setSortKey] = useState<'id' | 'created' | 'due' | 'priority'>("created")
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("desc")
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)

  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<StaffTask | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [edit, setEdit] = useState<{ id?: number, title: string, assignee: string, due_date: string, priority: TaskPriority, status: TaskStatus, description: string }>({ title: '', assignee: '', due_date: '', priority: 'MEDIUM', status: 'TODO', description: '' })
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean, id?: number }>({ open: false })

  useEffect(() => { if (!flash) return; const t = setTimeout(() => setFlash(null), 3000); return () => clearTimeout(t) }, [flash])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = rows.filter(r => r.title.toLowerCase().includes(q) || r.assignee.toLowerCase().includes(q) || (r.description||'').toLowerCase().includes(q))
    if (filterStatus !== 'ALL') list = list.filter(r => r.status === filterStatus)
    const dir = sortOrder === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      if (sortKey === 'id') return (a.id - b.id) * dir
      if (sortKey === 'due') return (a.due_date || '').localeCompare(b.due_date || '') * dir
      if (sortKey === 'priority') return priorityWeight(a.priority) - priorityWeight(b.priority) * dir
      return a.created_at.localeCompare(b.created_at) * dir
    })
  }, [rows, query, filterStatus, sortKey, sortOrder])

  function priorityWeight(p: TaskPriority) { return p === 'HIGH' ? 3 : p === 'MEDIUM' ? 2 : 1 }

  function renderPriorityBadge(p: TaskPriority) {
    if (p === 'HIGH') return <Badge tone="warning">HIGH</Badge>
    if (p === 'LOW') return <Badge tone="muted">LOW</Badge>
    return <Badge>MEDIUM</Badge>
  }
  function renderStatusBadge(s: TaskStatus) {
    if (s === 'DONE') return <Badge tone="success">DONE</Badge>
    if (s === 'CANCELLED') return <Badge tone="warning">CANCELLED</Badge>
    if (s === 'IN_PROGRESS') return <Badge>IN_PROGRESS</Badge>
    return <Badge tone="muted">TODO</Badge>
  }

  function openCreate() {
    setEdit({ title: '', assignee: '', due_date: '', priority: 'MEDIUM', status: 'TODO', description: '' })
    setEditOpen(true)
  }
  function openEditRow(r: StaffTask) {
    setEdit({ id: r.id, title: r.title, assignee: r.assignee, due_date: r.due_date || '', priority: r.priority, status: r.status, description: r.description || '' })
    setEditOpen(true)
  }
  function confirmDelete(id: number) { setConfirmOpen({ open: true, id }) }
  function doDelete() { if (!confirmOpen.id) return; setRows(rs => rs.filter(r => r.id !== confirmOpen.id)); setConfirmOpen({ open: false }); setFlash({ type: 'success', text: 'Đã xóa công việc.' }) }

  function save() {
    if (!edit.title.trim() || !edit.assignee.trim()) {
      setFlash({ type: 'error', text: 'Vui lòng nhập Tiêu đề và Người phụ trách.' })
      return
    }
    const payload: StaffTask = {
      id: edit.id ?? (rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1),
      title: edit.title.trim(),
      assignee: edit.assignee.trim(),
      due_date: edit.due_date || undefined,
      priority: edit.priority,
      status: edit.status,
      description: edit.description.trim() || undefined,
      created_at: edit.id ? rows.find(r => r.id === edit.id)!.created_at : new Date().toISOString(),
    }
    if (edit.id) { setRows(rs => rs.map(r => r.id === edit.id ? payload : r)); setFlash({ type: 'success', text: 'Đã cập nhật công việc.' }) }
    else { setRows(rs => [...rs, payload]); setFlash({ type: 'success', text: 'Đã tạo công việc mới.' }) }
    setEditOpen(false)
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Quản lý công việc nhân viên</h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">Theo dõi và quản lý các công việc của nhân viên</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button className="h-8 sm:h-9 px-3 sm:px-4 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-xs sm:text-sm whitespace-nowrap" onClick={openCreate}>
              Tạo công việc
            </Button>
            <button
              aria-label="Xuất Excel (CSV)"
              title="Xuất Excel (CSV)"
              className="h-8 sm:h-9 px-2 sm:px-3 rounded-md border border-gray-300 bg-white text-xs sm:text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              onClick={() => {
                const csv = [['ID', 'Tiêu đề', 'Người phụ trách', 'Hạn', 'Ưu tiên', 'Trạng thái', 'Mô tả', 'Ngày tạo'], ...filtered.map(r => [r.id, r.title, r.assignee, r.due_date || '', r.priority, r.status, r.description || '', r.created_at])]
                const blob = new Blob([csv.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'tasks.xlsx'
                a.click()
                URL.revokeObjectURL(url)
              }}
            >
              Xuất Excel
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        {flash && (
          <div className={`rounded-md border p-2 sm:p-3 text-xs sm:text-sm shadow-sm ${flash.type==='success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {flash.text}
          </div>
        )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
          <Input 
            className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm" 
            placeholder="Tìm theo tiêu đề, người phụ trách..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <select 
            className="h-8 sm:h-9 rounded-md border border-gray-300 bg-white px-2 sm:px-3 text-xs sm:text-sm w-full" 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Sắp xếp</label>
          <select 
            className="h-8 sm:h-9 rounded-md border border-gray-300 bg-white px-2 sm:px-3 text-xs sm:text-sm w-full" 
            value={sortKey} 
            onChange={(e) => setSortKey(e.target.value as any)}
          >
            <option value="created">Ngày tạo</option>
            <option value="due">Hạn</option>
            <option value="priority">Ưu tiên</option>
            <option value="id">ID</option>
          </select>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
          <select 
            className="h-8 sm:h-9 rounded-md border border-gray-300 bg-white px-2 sm:px-3 text-xs sm:text-sm w-full" 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value as any)}
          >
            <option value="asc">Tăng dần</option>
            <option value="desc">Giảm dần</option>
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="text-xs sm:text-sm text-gray-600">Tổng: {filtered.length} công việc</div>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700">Tiêu đề</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700">Người phụ trách</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700">Hạn</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700">Ưu tiên</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700">Trạng thái</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice((page - 1) * size, (page - 1) * size + size).map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2">
                      <span 
                        role="button" 
                        tabIndex={0} 
                        className="cursor-pointer underline underline-offset-2 text-blue-600 hover:text-blue-700 text-xs sm:text-sm truncate block" 
                        onClick={() => { setSelected(r); setDetailOpen(true); }}
                        title={r.title}
                      >
                        {r.title}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm truncate" title={r.assignee}>{r.assignee}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap">{r.due_date || '—'}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">{renderPriorityBadge(r.priority)}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">{renderStatusBadge(r.status)}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <Button 
                          variant="secondary" 
                          onClick={() => openEditRow(r)}
                          className="h-6 sm:h-8 px-2 sm:px-3 text-xs"
                        >
                          Sửa
                        </Button>
                        <Button 
                          variant="danger" 
                          onClick={() => confirmDelete(r.id)}
                          className="h-6 sm:h-8 px-2 sm:px-3 text-xs"
                        >
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span>Hàng:</span>
                <select 
                  className="h-7 sm:h-8 rounded-md border border-gray-300 bg-white px-2 sm:px-3 text-xs" 
                  value={size} 
                  onChange={(e) => { setPage(1); setSize(parseInt(e.target.value, 10)); }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-gray-500">trên {filtered.length}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Button 
                  variant="secondary" 
                  className="h-7 sm:h-8 px-2 sm:px-3 text-xs" 
                  disabled={page === 1} 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Trước
                </Button>
                <span className="px-2">Trang {page} / {Math.max(1, Math.ceil(filtered.length / size))}</span>
                <Button 
                  variant="secondary" 
                  className="h-7 sm:h-8 px-2 sm:px-3 text-xs" 
                  disabled={page >= Math.ceil(filtered.length / size)} 
                  onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / size), p + 1))}
                >
                  Sau
                </Button>
              </div>
            </div>
        </CardBody>
      </Card>

      {/* Modal chi tiết */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết công việc">
        {selected ? (
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">ID:</span> {selected.id}</div>
            <div><span className="font-medium">Tiêu đề:</span> {selected.title}</div>
            <div><span className="font-medium">Người phụ trách:</span> {selected.assignee}</div>
            <div><span className="font-medium">Hạn:</span> {selected.due_date || '—'}</div>
            <div><span className="font-medium">Ưu tiên:</span> {selected.priority}</div>
            <div><span className="font-medium">Trạng thái:</span> {selected.status}</div>
            <div><span className="font-medium">Mô tả:</span> {selected.description || '—'}</div>
            <div><span className="font-medium">Ngày tạo:</span> {selected.created_at.replace('T',' ')}</div>
          </div>
        ) : null}
      </Modal>

      {/* Modal tạo/sửa */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={edit.id ? 'Sửa công việc' : 'Tạo công việc'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Hủy</Button>
            <Button onClick={save}>Lưu</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Tiêu đề</label>
              <Input value={edit.title} onChange={(e) => setEdit((f) => ({ ...f, title: e.target.value }))} />
              {!edit.title.trim() && <div className="mt-1 text-xs text-red-600">Bắt buộc.</div>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Người phụ trách</label>
              <Input value={edit.assignee} onChange={(e) => setEdit((f) => ({ ...f, assignee: e.target.value }))} />
              {!edit.assignee.trim() && <div className="mt-1 text-xs text-red-600">Bắt buộc.</div>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Hạn</label>
              <Input type="date" value={edit.due_date} onChange={(e) => setEdit((f) => ({ ...f, due_date: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Ưu tiên</label>
              <select className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" value={edit.priority} onChange={(e) => setEdit((f) => ({ ...f, priority: e.target.value as TaskPriority }))}>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Trạng thái</label>
              <select className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" value={edit.status} onChange={(e) => setEdit((f) => ({ ...f, status: e.target.value as TaskStatus }))}>
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Mô tả</label>
              <Input value={edit.description} onChange={(e) => setEdit((f) => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Xác nhận xóa */}
      <Modal
        open={confirmOpen.open}
        onClose={() => setConfirmOpen({ open: false })}
        title="Xác nhận xóa"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmOpen({ open: false })}>Hủy</Button>
            <Button variant="danger" onClick={doDelete}>Xóa</Button>
          </div>
        }
      >
        <div className="text-sm text-gray-700">Bạn có chắc muốn xóa công việc này?</div>
      </Modal>
      </div>
    </>
  );
}



