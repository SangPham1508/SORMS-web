"use client";

import { useEffect, useMemo, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";

type Checkin = {
  id: number
  booking_code: string
  user_name: string
  room_code: string
  face_ref?: string
  checkin_at: string
  checkout_at?: string
}

const mock: Checkin[] = [
  { id: 1, booking_code: 'BK-0003', user_name: 'Le Van C', room_code: 'C301', checkin_at: '2025-10-17T13:20:00' },
  { id: 2, booking_code: 'BK-0002', user_name: 'Tran Thi B', room_code: 'B201', checkin_at: '2025-10-18T09:00:00', checkout_at: '2025-10-20T10:00:00' },
]

export default function CheckinsPage() {
  const [rows, setRows] = useState<Checkin[]>(mock)
  const [flash, setFlash] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState<'id' | 'checkin' | 'checkout'>("checkin")
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("desc")
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)

  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Checkin | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [edit, setEdit] = useState<{ id?: number, booking_code: string, user_name: string, room_code: string, checkin_at: string, checkout_at: string, face_ref: string }>({ booking_code: '', user_name: '', room_code: '', checkin_at: '', checkout_at: '', face_ref: '' })
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean, id?: number } >({ open: false })

  useEffect(() => { if (!flash) return; const t = setTimeout(() => setFlash(null), 3000); return () => clearTimeout(t) }, [flash])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q ? rows.filter(r => r.booking_code.toLowerCase().includes(q) || r.user_name.toLowerCase().includes(q) || r.room_code.toLowerCase().includes(q)) : rows
    const dir = sortOrder === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      if (sortKey === 'id') return (a.id - b.id) * dir
      if (sortKey === 'checkin') return a.checkin_at.localeCompare(b.checkin_at) * dir
      return (a.checkout_at || '').localeCompare(b.checkout_at || '') * dir
    })
  }, [rows, query, sortKey, sortOrder])

  function openCreate() {
    setEdit({ booking_code: '', user_name: '', room_code: '', checkin_at: '', checkout_at: '', face_ref: '' })
    setEditOpen(true)
  }

  function openEditRow(r: Checkin) {
    setEdit({ id: r.id, booking_code: r.booking_code, user_name: r.user_name, room_code: r.room_code, checkin_at: r.checkin_at.slice(0,16), checkout_at: r.checkout_at ? r.checkout_at.slice(0,16) : '', face_ref: r.face_ref || '' })
    setEditOpen(true)
  }

  function save() {
    if (!edit.booking_code.trim() || !edit.user_name.trim() || !edit.room_code.trim() || !edit.checkin_at) {
      setFlash({ type: 'error', text: 'Vui lòng nhập đủ Booking, Khách, Phòng và thời gian check‑in.' })
      return
    }
    const payload: Checkin = {
      id: edit.id ?? (rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1),
      booking_code: edit.booking_code.trim(),
      user_name: edit.user_name.trim(),
      room_code: edit.room_code.trim(),
      checkin_at: edit.checkin_at,
      checkout_at: edit.checkout_at || undefined,
      face_ref: edit.face_ref || undefined,
    }
    if (edit.id) { setRows(rs => rs.map(r => r.id === edit.id ? payload : r)); setFlash({ type: 'success', text: 'Đã cập nhật check‑in.' }) }
    else { setRows(rs => [...rs, payload]); setFlash({ type: 'success', text: 'Đã tạo check‑in mới.' }) }
    setEditOpen(false)
  }

  function confirmDelete(id: number) { setConfirmOpen({ open: true, id }) }
  function doDelete() { if (!confirmOpen.id) return; setRows(rs => rs.filter(r => r.id !== confirmOpen.id)); setConfirmOpen({ open: false }); setFlash({ type: 'success', text: 'Đã xóa check‑in.' }) }

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-gray-900 truncate">Check-in</h1>
              <p className="text-xs text-gray-500">{filtered.length} check-in</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={openCreate} 
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-sm flex-shrink-0"
            >
              <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">Tạo check-in</span>
              <span className="sm:hidden">Tạo</span>
            </Button>
            <button
              type="button"
              aria-label="Xuất Excel"
              title="Xuất Excel"
              className="h-8 px-2 rounded-md border border-gray-300 bg-white text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1"
              onClick={() => {
                const headers = ['ID','Booking','Khach','Phong','Checkin','Checkout','FaceRef']
                const csv = [headers.join(','), ...filtered.map(r => [
                  r.id,
                  `"${r.booking_code}"`,
                  `"${r.user_name}"`,
                  `"${r.room_code}"`,
                  r.checkin_at,
                  r.checkout_at || '',
                  `"${(r.face_ref||'').replace(/"/g,'""')}"`
                ].join(','))].join('\n')
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `checkins_${new Date().toISOString().slice(0,10)}.xlsx`
                a.click()
                URL.revokeObjectURL(url)
              }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="space-y-3">
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
              placeholder="Tìm theo booking code, khách, phòng..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Sắp xếp</label>
            <select 
              className="h-8 sm:h-9 rounded-md border border-gray-300 bg-white px-2 sm:px-3 text-xs sm:text-sm w-full" 
              value={sortKey} 
              onChange={(e) => setSortKey(e.target.value as any)}
            >
              <option value="checkin">Check-in</option>
              <option value="checkout">Check-out</option>
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
          <div></div>
        </div>

      <Card>
        <CardHeader>
          <div className="text-xs sm:text-sm text-gray-600">Tổng: {filtered.length} check‑in</div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full table-fixed text-xs sm:text-sm">
            <colgroup>
              <col className="w-[5%]" />
              <col className="w-[10%]" />
              <col className="w-[15%]" />
              <col className="w-[12%]" />
              <col className="w-[16%]" />
              <col className="w-[16%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead>
              <tr className="bg-gray-200 text-gray-700 text-xs sm:text-sm">
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">ID</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Booking</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Khách</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Phòng</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Check‑in</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Check‑out</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice((page - 1) * size, (page - 1) * size + size).map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap text-xs sm:text-sm">{r.id}</td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                    <span role="button" tabIndex={0} className="cursor-pointer underline underline-offset-2 text-blue-600 hover:text-blue-700 text-xs sm:text-sm" onClick={() => { setSelected(r); setDetailOpen(true); }}>{r.booking_code}</span>
                  </td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 truncate max-w-[180px] sm:max-w-[240px] lg:max-w-[360px] text-xs sm:text-sm" title={r.user_name}>{r.user_name}</td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap text-xs sm:text-sm">{r.room_code}</td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap text-xs sm:text-sm">{r.checkin_at.replace('T',' ')}</td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap text-xs sm:text-sm">{r.checkout_at ? r.checkout_at.replace('T',' ') : '—'}</td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <Button variant="secondary" className="h-6 sm:h-8 px-2 sm:px-3 text-xs" onClick={() => openEditRow(r)}>Sửa</Button>
                      <Button variant="danger" className="h-6 sm:h-8 px-2 sm:px-3 text-xs" onClick={() => confirmDelete(r.id)}>Xóa</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span>Hàng:</span>
              <select className="h-7 sm:h-8 rounded-md border border-gray-300 bg-white px-2 text-xs sm:text-sm" value={size} onChange={(e) => { setPage(1); setSize(parseInt(e.target.value, 10)); }}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-gray-500">trên {filtered.length}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="secondary" className="h-7 sm:h-8 px-2 sm:px-3 text-xs" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Trước</Button>
              <span className="px-2 text-xs sm:text-sm">Trang {page} / {Math.max(1, Math.ceil(filtered.length / size))}</span>
              <Button variant="secondary" className="h-7 sm:h-8 px-2 sm:px-3 text-xs" disabled={page >= Math.ceil(filtered.length / size)} onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / size), p + 1))}>Sau</Button>
            </div>
          </div>
        </CardBody>
      </Card>
        </div>
      </div>

      {/* Modal chi tiết */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết check‑in">
        {selected ? (
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">ID:</span> {selected.id}</div>
            <div><span className="font-medium">Booking:</span> {selected.booking_code}</div>
            <div><span className="font-medium">Khách:</span> {selected.user_name}</div>
            <div><span className="font-medium">Phòng:</span> {selected.room_code}</div>
            <div><span className="font-medium">Check‑in:</span> {selected.checkin_at.replace('T',' ')}</div>
            <div><span className="font-medium">Check‑out:</span> {selected.checkout_at ? selected.checkout_at.replace('T',' ') : '—'}</div>
            <div><span className="font-medium">Face ref:</span> {selected.face_ref || '—'}</div>
          </div>
        ) : null}
      </Modal>

      {/* Modal tạo/sửa */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={edit.id ? 'Sửa check‑in' : 'Tạo check‑in'}
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
              <label className="mb-1 block text-sm font-medium">Booking</label>
              <Input value={edit.booking_code} onChange={(e) => setEdit((f) => ({ ...f, booking_code: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Khách</label>
              <Input value={edit.user_name} onChange={(e) => setEdit((f) => ({ ...f, user_name: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Phòng</label>
              <Input value={edit.room_code} onChange={(e) => setEdit((f) => ({ ...f, room_code: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Face ref</label>
              <Input value={edit.face_ref} onChange={(e) => setEdit((f) => ({ ...f, face_ref: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Check‑in</label>
              <Input type="datetime-local" value={edit.checkin_at} onChange={(e) => setEdit((f) => ({ ...f, checkin_at: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Check‑out</label>
              <Input type="datetime-local" value={edit.checkout_at} onChange={(e) => setEdit((f) => ({ ...f, checkout_at: e.target.value }))} />
            </div>
          </div>
          {(!edit.booking_code.trim() || !edit.user_name.trim() || !edit.room_code.trim() || !edit.checkin_at) && (
            <div className="text-xs text-red-600">Vui lòng nhập đủ Booking, Khách, Phòng và thời gian check‑in.</div>
          )}
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
        <div className="text-sm text-gray-700">Bạn có chắc muốn xóa bản ghi check‑in này?        </div>
      </Modal>
    </>
  );
}



