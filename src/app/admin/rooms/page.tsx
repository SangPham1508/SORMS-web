"use client";

import { useEffect, useMemo, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";

import { mockRooms, type Room, type RoomStatus } from '@/lib/mock-data'

const statusOptions: RoomStatus[] = ["AVAILABLE", "OCCUPIED", "MAINTENANCE", "CLEANING", "OUT_OF_SERVICE"]

export default function RoomsPage() {
  const [rows, setRows] = useState<Room[]>(mockRooms)
  const [flash, setFlash] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [query, setQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"ALL" | RoomStatus>("ALL")
  const [sortKey, setSortKey] = useState<"id" | "code" | "room_type">("code")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)

  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Room | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [edit, setEdit] = useState<{ id?: number, code: string, name: string, room_type: string, floor: string, status: RoomStatus, description: string }>({ code: "", name: "", room_type: "", floor: "", status: "AVAILABLE", description: "" })
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean, id?: number }>({ open: false })

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(null), 3000)
    return () => clearTimeout(t)
  }, [flash])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = rows.filter(r =>
      r.code.toLowerCase().includes(q) ||
      (r.name || "").toLowerCase().includes(q) ||
      r.room_type.toLowerCase().includes(q) ||
      (r.description || "").toLowerCase().includes(q)
    )
    if (filterStatus !== "ALL") list = list.filter(r => r.status === filterStatus)
    const dir = sortOrder === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      if (sortKey === 'id') return (a.id - b.id) * dir
      if (sortKey === 'code') return a.code.localeCompare(b.code) * dir
      return a.room_type.localeCompare(b.room_type) * dir
    })
  }, [rows, query, filterStatus, sortKey, sortOrder])

  function openCreate() {
    setEdit({ code: "", name: "", room_type: "", floor: "", status: "AVAILABLE", description: "" })
    setEditOpen(true)
  }

  function openEdit(r: Room) {
    setEdit({ id: r.id, code: r.code, name: r.name || "", room_type: r.room_type, floor: r.floor != null ? String(r.floor) : "", status: r.status, description: r.description || "" })
    setEditOpen(true)
  }

  function save() {
    if (!edit.code.trim() || !edit.room_type.trim()) {
      setFlash({ type: 'error', text: 'Vui lòng nhập Code và Room Type.' })
      return
    }
    if (edit.floor && isNaN(Number(edit.floor))) {
      setFlash({ type: 'error', text: 'Tầng phải là số.' })
      return
    }
    const payload: Room = {
      id: edit.id ?? (rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1),
      code: edit.code.trim(),
      name: edit.name.trim() || undefined,
      room_type: edit.room_type.trim(),
      floor: edit.floor ? Number(edit.floor) : undefined,
      status: edit.status,
      description: edit.description.trim() || undefined,
    }
    if (edit.id) {
      setRows(rs => rs.map(r => r.id === edit.id ? payload : r))
      setFlash({ type: 'success', text: 'Đã cập nhật phòng.' })
    } else {
      setRows(rs => [...rs, payload])
      setFlash({ type: 'success', text: 'Đã tạo phòng mới.' })
    }
    setEditOpen(false)
  }

  function confirmDelete(id: number) {
    setConfirmOpen({ open: true, id })
  }

  function doDelete() {
    if (!confirmOpen.id) return
    setRows(rs => rs.filter(r => r.id !== confirmOpen.id))
    setConfirmOpen({ open: false })
    setFlash({ type: 'success', text: 'Đã xóa phòng.' })
  }

  function renderStatusChip(s: RoomStatus) {
    if (s === 'AVAILABLE') return <Badge tone="success">AVAILABLE</Badge>
    if (s === 'OCCUPIED') return <Badge>OCCUPIED</Badge>
    if (s === 'MAINTENANCE') return <Badge tone="warning">MAINTENANCE</Badge>
    if (s === 'CLEANING') return <Badge tone="muted">CLEANING</Badge>
    return <Badge tone="muted">OUT OF SERVICE</Badge>
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Quản lý phòng</h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">Theo dõi và quản lý các phòng trong hệ thống</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button className="h-8 sm:h-9 px-3 sm:px-4 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-xs sm:text-sm whitespace-nowrap" onClick={openCreate}>
              Tạo phòng
            </Button>
            <button
              aria-label="Xuất Excel (CSV)"
              title="Xuất Excel (CSV)"
              className="h-8 sm:h-9 px-2 sm:px-3 rounded-md border border-gray-300 bg-white text-xs sm:text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              onClick={() => {
                const csv = [['ID', 'Code', 'Tên', 'Loại phòng', 'Tầng', 'Trạng thái', 'Mô tả'], ...filtered.map(r => [r.id, r.code, r.name || '', r.room_type, r.floor || '', r.status, r.description || ''])]
                const blob = new Blob([csv.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'rooms.xlsx'
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
            placeholder="Tìm theo code, tên, loại phòng..." 
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
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Sắp xếp</label>
          <select 
            className="h-8 sm:h-9 rounded-md border border-gray-300 bg-white px-2 sm:px-3 text-xs sm:text-sm w-full" 
            value={sortKey} 
            onChange={(e) => setSortKey(e.target.value as any)}
          >
            <option value="code">Code</option>
            <option value="room_type">Loại phòng</option>
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
          <div className="text-xs sm:text-sm text-gray-600">Tổng: {filtered.length} phòng</div>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700">ID</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700">Code</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700">Loại phòng</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700">Tầng</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700">Trạng thái</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice((page - 1) * size, (page - 1) * size + size).map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap">{r.id}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2">
                      <span 
                        role="button" 
                        tabIndex={0} 
                        className="cursor-pointer underline underline-offset-2 text-blue-600 hover:text-blue-700 text-xs sm:text-sm" 
                        onClick={() => { setSelected(r); setDetailOpen(true); }}
                      >
                        {r.code}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm truncate" title={r.room_type}>{r.room_type}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap">{r.floor ?? '—'}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">{renderStatusChip(r.status)}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <Button 
                          variant="secondary" 
                          onClick={() => openEdit(r)}
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
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết phòng">
        {selected ? (
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">ID:</span> {selected.id}</div>
            <div><span className="font-medium">Code:</span> {selected.code}</div>
            <div><span className="font-medium">Tên:</span> {selected.name || '—'}</div>
            <div><span className="font-medium">Loại phòng:</span> {selected.room_type}</div>
            <div><span className="font-medium">Tầng:</span> {selected.floor ?? '—'}</div>
            <div><span className="font-medium">Trạng thái:</span> {selected.status}</div>
            <div><span className="font-medium">Mô tả:</span> {selected.description || '—'}</div>
          </div>
        ) : null}
      </Modal>

      {/* Modal tạo/sửa */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={edit.id ? 'Sửa phòng' : 'Tạo phòng'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Hủy</Button>
            <Button onClick={save}>Lưu</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Code</label>
            <Input value={edit.code} onChange={(e) => setEdit((f) => ({ ...f, code: e.target.value }))} />
            {!edit.code.trim() && <div className="mt-1 text-xs text-red-600">Code bắt buộc.</div>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Tên</label>
            <Input value={edit.name} onChange={(e) => setEdit((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Loại phòng</label>
              <Input value={edit.room_type} onChange={(e) => setEdit((f) => ({ ...f, room_type: e.target.value }))} />
              {!edit.room_type.trim() && <div className="mt-1 text-xs text-red-600">Room Type bắt buộc.</div>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tầng</label>
              <Input value={edit.floor} onChange={(e) => setEdit((f) => ({ ...f, floor: e.target.value }))} />
              {edit.floor !== '' && isNaN(Number(edit.floor)) && <div className="mt-1 text-xs text-red-600">Tầng phải là số.</div>}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Trạng thái</label>
            <select className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" value={edit.status} onChange={(e) => setEdit((f) => ({ ...f, status: e.target.value as RoomStatus }))}>
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Mô tả</label>
            <Input value={edit.description} onChange={(e) => setEdit((f) => ({ ...f, description: e.target.value }))} />
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
        <div className="text-sm text-gray-700">Bạn có chắc muốn xóa phòng này?</div>
      </Modal>
      </div>
    </>
  );
}



