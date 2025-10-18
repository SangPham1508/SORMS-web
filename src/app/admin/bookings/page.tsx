"use client";

import { useEffect, useMemo, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";

import { mockBookings, type Booking, type BookingStatus } from '@/lib/mock-data'

const statusOptions: BookingStatus[] = ['PENDING','APPROVED','REJECTED','CANCELLED','CHECKED_IN','CHECKED_OUT']

export default function BookingsPage() {
  const [rows, setRows] = useState<Booking[]>(mockBookings)
  const [flash, setFlash] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [query, setQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [filterStatus, setFilterStatus] = useState<'ALL' | BookingStatus>('ALL')
  const [sortKey, setSortKey] = useState<'id' | 'code' | 'checkin' | 'checkout'>("checkin")
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("asc")
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)

  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Booking | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [edit, setEdit] = useState<{ id?: number, code: string, user_name: string, room_code: string, checkin_date: string, checkout_date: string, num_guests: string, status: BookingStatus, note: string }>({ code: '', user_name: '', room_code: '', checkin_date: '', checkout_date: '', num_guests: '1', status: 'PENDING', note: '' })
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean, id?: number, type?: 'approve' | 'reject' | 'delete' }>({ open: false })

  useEffect(() => { if (!flash) return; const t = setTimeout(() => setFlash(null), 3000); return () => clearTimeout(t) }, [flash])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = rows.filter(r =>
      r.code.toLowerCase().includes(q) ||
      r.user_name.toLowerCase().includes(q) ||
      r.room_code.toLowerCase().includes(q)
    )
    if (filterStatus !== 'ALL') list = list.filter(r => r.status === filterStatus)
    if (dateFrom) list = list.filter(r => r.checkin_date >= dateFrom)
    if (dateTo) list = list.filter(r => r.checkout_date <= dateTo)
    const dir = sortOrder === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      if (sortKey === 'id') return (a.id - b.id) * dir
      if (sortKey === 'code') return a.code.localeCompare(b.code) * dir
      if (sortKey === 'checkin') return (a.checkin_date.localeCompare(b.checkin_date)) * dir
      return (a.checkout_date.localeCompare(b.checkout_date)) * dir
    })
  }, [rows, query, filterStatus, sortKey, sortOrder])

  function openCreate() {
    setEdit({ code: '', user_name: '', room_code: '', checkin_date: '', checkout_date: '', num_guests: '1', status: 'PENDING', note: '' })
    setEditOpen(true)
  }
  function openEditRow(r: Booking) {
    setEdit({ id: r.id, code: r.code, user_name: r.user_name, room_code: r.room_code, checkin_date: r.checkin_date, checkout_date: r.checkout_date, num_guests: String(r.num_guests), status: r.status, note: r.note || '' })
    setEditOpen(true)
  }

  function datesValid(ci: string, co: string) { return !!ci && !!co && ci < co }

  function save() {
    if (!edit.code.trim() || !edit.user_name.trim() || !edit.room_code.trim() || !datesValid(edit.checkin_date, edit.checkout_date) || isNaN(Number(edit.num_guests)) || Number(edit.num_guests) <= 0) {
      setFlash({ type: 'error', text: 'Vui lòng nhập đủ thông tin và ngày hợp lệ (checkout > checkin).' })
      return
    }
    const payload: Booking = {
      id: edit.id ?? (rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1),
      code: edit.code.trim(),
      user_name: edit.user_name.trim(),
      room_code: edit.room_code.trim(),
      checkin_date: edit.checkin_date,
      checkout_date: edit.checkout_date,
      num_guests: Number(edit.num_guests),
      status: edit.status,
      note: edit.note.trim() || undefined,
    }
    if (edit.id) {
      setRows(rs => rs.map(r => r.id === edit.id ? payload : r)); setFlash({ type: 'success', text: 'Đã cập nhật booking.' })
    } else {
      setRows(rs => [...rs, payload]); setFlash({ type: 'success', text: 'Đã tạo booking mới.' })
    }
    setEditOpen(false)
  }

  function renderBookingStatusChip(s: BookingStatus) {
    if (s === 'APPROVED' || s === 'CHECKED_IN') return <Badge tone="success">{s}</Badge>
    if (s === 'REJECTED' || s === 'CANCELLED') return <Badge tone="warning">{s}</Badge>
    if (s === 'CHECKED_OUT') return <Badge tone="muted">{s}</Badge>
    return <Badge>{s}</Badge>
  }

  function confirm(type: 'approve' | 'reject' | 'delete', id: number) { setConfirmOpen({ open: true, type, id }) }
  function confirmApply() {
    if (!confirmOpen.id || !confirmOpen.type) return
    if (confirmOpen.type === 'delete') {
      setRows(rs => rs.filter(r => r.id !== confirmOpen.id)); setFlash({ type: 'success', text: 'Đã xóa booking.' })
    } else {
      setRows(rs => rs.map(r => r.id === confirmOpen.id ? { ...r, status: confirmOpen.type === 'approve' ? 'APPROVED' : 'REJECTED' } : r));
      setFlash({ type: 'success', text: confirmOpen.type === 'approve' ? 'Đã phê duyệt booking.' : 'Đã từ chối booking.' })
    }
    setConfirmOpen({ open: false })
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Quản lý đặt phòng</h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">Theo dõi và quản lý các đặt phòng</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button className="h-8 sm:h-9 px-3 sm:px-4 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-xs sm:text-sm whitespace-nowrap" onClick={openCreate}>
              Tạo booking
            </Button>
            <button
              aria-label="Xuất Excel (CSV)"
              title="Xuất Excel (CSV)"
              className="h-8 sm:h-9 px-2 sm:px-3 rounded-md border border-gray-300 bg-white text-xs sm:text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              onClick={() => {
                const csv = [['ID', 'Code', 'Khách', 'Phòng', 'Check-in', 'Check-out', 'Số khách', 'Trạng thái', 'Ghi chú'], ...filtered.map(r => [r.id, r.code, r.user_name, r.room_code, r.checkin_date, r.checkout_date, r.num_guests, r.status, r.note || ''])]
                const blob = new Blob([csv.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'bookings.xlsx'
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
        <div className="space-y-4">
          {/* Row 1: Search and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input 
              className="w-full h-9 px-3 py-2 border border-gray-300 rounded-md text-sm" 
              placeholder="Tìm theo code, khách, phòng..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
            />
            <select 
              className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm" 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          {/* Row 2: Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Từ ngày</label>
                <Input 
                  type="date" 
                  className="h-9 text-sm" 
                  value={dateFrom} 
                  onChange={(e) => setDateFrom(e.target.value)} 
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Đến ngày</label>
                <Input 
                  type="date" 
                  className="h-9 text-sm" 
                  value={dateTo} 
                  onChange={(e) => setDateTo(e.target.value)} 
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Sắp xếp theo</label>
                <select 
                  className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm" 
                  value={sortKey} 
                  onChange={(e) => setSortKey(e.target.value as any)}
                >
                  <option value="checkin">Check-in</option>
                  <option value="checkout">Check-out</option>
                  <option value="code">Code</option>
                  <option value="id">ID</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Thứ tự</label>
                <select 
                  className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm" 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value as any)}
                >
                  <option value="asc">Tăng dần</option>
                  <option value="desc">Giảm dần</option>
                </select>
              </div>
            </div>
          </div>
        </div>


      <Card>
        <CardHeader>
          <div className="text-xs sm:text-sm text-gray-600">Tổng: {filtered.length} booking</div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full table-fixed text-xs sm:text-sm">
            <colgroup>
              <col className="w-[8%]" />
              <col className="w-[10%]" />
              <col className="w-[16%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[8%]" />
              <col className="w-[12%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead>
              <tr className="bg-gray-200 text-gray-700 text-xs sm:text-sm">
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">ID</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Code</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Khách</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Check‑in</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Check‑out</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Số khách</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Trạng thái</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice((page - 1) * size, (page - 1) * size + size).map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap text-xs sm:text-sm">{r.id}</td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                    <span role="button" tabIndex={0} className="cursor-pointer underline underline-offset-2 text-blue-600 hover:text-blue-700 text-xs sm:text-sm" onClick={() => { setSelected(r); setDetailOpen(true); }}>{r.code}</span>
                  </td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 max-w-[180px] sm:max-w-[220px] lg:max-w-[320px] truncate text-xs sm:text-sm" title={`${r.user_name} – ${r.room_code}`}>{r.user_name} – {r.room_code}</td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap text-xs sm:text-sm">{r.checkin_date}</td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap text-xs sm:text-sm">{r.checkout_date}</td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap text-xs sm:text-sm">{r.num_guests}</td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">{renderBookingStatusChip(r.status)}</td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <Button variant="secondary" className="h-6 sm:h-8 px-2 sm:px-3 text-xs" onClick={() => openEditRow(r)}>Sửa</Button>
                      {r.status === 'PENDING' ? (
                        <>
                          <Button className="h-6 sm:h-8 px-2 sm:px-3 text-xs" onClick={() => confirm('approve', r.id)}>Duyệt</Button>
                          <Button variant="danger" className="h-6 sm:h-8 px-2 sm:px-3 text-xs" onClick={() => confirm('reject', r.id)}>Từ chối</Button>
                        </>
                      ) : (
                        <Button variant="danger" className="h-6 sm:h-8 px-2 sm:px-3 text-xs" onClick={() => confirm('delete', r.id)}>Xóa</Button>
                      )}
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

      {/* Modal chi tiết */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết booking">
        {selected ? (
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">ID:</span> {selected.id}</div>
            <div><span className="font-medium">Code:</span> {selected.code}</div>
            <div><span className="font-medium">Khách:</span> {selected.user_name}</div>
            <div><span className="font-medium">Phòng:</span> {selected.room_code}</div>
            <div><span className="font-medium">Check‑in:</span> {selected.checkin_date}</div>
            <div><span className="font-medium">Check‑out:</span> {selected.checkout_date}</div>
            <div><span className="font-medium">Số khách:</span> {selected.num_guests}</div>
            <div><span className="font-medium">Trạng thái:</span> {selected.status}</div>
            <div><span className="font-medium">Ghi chú:</span> {selected.note || '—'}</div>
          </div>
        ) : null}
      </Modal>

      {/* Modal tạo/sửa */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={edit.id ? 'Sửa booking' : 'Tạo booking'}
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
              <label className="mb-1 block text-sm font-medium">Code</label>
              <Input value={edit.code} onChange={(e) => setEdit((f) => ({ ...f, code: e.target.value }))} />
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
              <label className="mb-1 block text-sm font-medium">Số khách</label>
              <Input value={edit.num_guests} onChange={(e) => setEdit((f) => ({ ...f, num_guests: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Check‑in</label>
              <Input type="date" value={edit.checkin_date} onChange={(e) => setEdit((f) => ({ ...f, checkin_date: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Check‑out</label>
              <Input type="date" value={edit.checkout_date} onChange={(e) => setEdit((f) => ({ ...f, checkout_date: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Trạng thái</label>
              <select className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" value={edit.status} onChange={(e) => setEdit((f) => ({ ...f, status: e.target.value as BookingStatus }))}>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Ghi chú</label>
              <Input value={edit.note} onChange={(e) => setEdit((f) => ({ ...f, note: e.target.value }))} />
            </div>
          </div>
          {(!edit.code.trim() || !edit.user_name.trim() || !edit.room_code.trim() || !datesValid(edit.checkin_date, edit.checkout_date) || isNaN(Number(edit.num_guests)) || Number(edit.num_guests) <= 0) && (
            <div className="text-xs text-red-600">Vui lòng nhập đủ thông tin hợp lệ (checkout &gt; checkin, số khách &gt; 0).</div>
          )}
        </div>
      </Modal>

      {/* Xác nhận hành động */}
      <Modal
        open={confirmOpen.open}
        onClose={() => setConfirmOpen({ open: false })}
        title={confirmOpen.type === 'delete' ? 'Xác nhận xóa' : confirmOpen.type === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmOpen({ open: false })}>Hủy</Button>
            <Button onClick={confirmApply}>Xác nhận</Button>
          </div>
        }
      >
        <div className="text-sm text-gray-700">
          {confirmOpen.type === 'delete' ? 'Bạn có chắc muốn xóa booking này?' : confirmOpen.type === 'approve' ? 'Duyệt booking này?' : 'Từ chối booking này?'}
        </div>
      </Modal>
      </div>
    </>
  );
}



