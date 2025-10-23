"use client";

import { useEffect, useMemo, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";

import { type Booking, type BookingStatus } from '@/lib/types'
import { useBookings, useRooms } from '@/hooks/useApi'

const statusOptions: BookingStatus[] = ['PENDING','APPROVED','REJECTED','CANCELLED','CHECKED_IN','CHECKED_OUT']

export default function BookingsPage() {
  const [rows, setRows] = useState<Booking[]>([])
  const { data: bookingsData, refetch: refetchBookings } = useBookings()
  const { data: roomsData, refetch: refetchRooms } = useRooms()
  const [rooms, setRooms] = useState<any[]>([])
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
  const [edit, setEdit] = useState<{ id?: number, code: string, userId: number, roomId: number, checkinDate: string, checkoutDate: string, numGuests: number, status: BookingStatus, note: string }>({ code: '', userId: 1, roomId: 1, checkinDate: '', checkoutDate: '', numGuests: 1, status: 'PENDING', note: '' })
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean, id?: number, type?: 'approve' | 'reject' | 'checkin' | 'delete' }>({ open: false })

  useEffect(() => { if (!flash) return; const t = setTimeout(() => setFlash(null), 3000); return () => clearTimeout(t) }, [flash])

  // Keyboard shortcuts for edit modal
  useEffect(() => {
    if (!editOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        save()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setEditOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [editOpen, edit])

  // Sync with hooks data
  useEffect(() => {
    if (bookingsData) setRows(bookingsData as Booking[])
  }, [bookingsData])

  useEffect(() => {
    if (roomsData) setRooms(roomsData as any[])
  }, [roomsData])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = rows.filter(r =>
      r.code.toLowerCase().includes(q) ||
      (r.userName || "").toLowerCase().includes(q) ||
      (r.roomCode || "").toLowerCase().includes(q) ||
      (r.note || "").toLowerCase().includes(q)
    )
    if (filterStatus !== 'ALL') list = list.filter(r => r.status === filterStatus)
    if (dateFrom) list = list.filter(r => r.checkinDate >= dateFrom)
    if (dateTo) list = list.filter(r => r.checkoutDate <= dateTo)
    const dir = sortOrder === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      if (sortKey === 'id') return (a.id - b.id) * dir
      if (sortKey === 'code') return a.code.localeCompare(b.code) * dir
      if (sortKey === 'checkin') return a.checkinDate.localeCompare(b.checkinDate) * dir
      return a.checkoutDate.localeCompare(b.checkoutDate) * dir
    })
  }, [rows, query, filterStatus, dateFrom, dateTo, sortKey, sortOrder])

  function openCreate() {
    setEdit({ code: '', userId: 1, roomId: 1, checkinDate: '', checkoutDate: '', numGuests: 1, status: 'PENDING', note: '' })
    setEditOpen(true)
  }

  function openEdit(r: Booking) {
    setEdit({ 
      id: r.id, 
      code: r.code, 
      userId: r.userId, 
      roomId: r.roomId, 
      checkinDate: r.checkinDate, 
      checkoutDate: r.checkoutDate, 
      numGuests: r.numGuests, 
      status: r.status, 
      note: r.note || '' 
    })
    setEditOpen(true)
  }

  async function save() {
    if (!edit.code.trim()) {
      setFlash({ type: 'error', text: 'Vui lòng nhập Code.' })
      return
    }
    if (!edit.checkinDate || !edit.checkoutDate) {
      setFlash({ type: 'error', text: 'Vui lòng nhập ngày check-in và check-out.' })
      return
    }
    if (new Date(edit.checkoutDate) <= new Date(edit.checkinDate)) {
      setFlash({ type: 'error', text: 'Ngày check-out phải sau ngày check-in.' })
      return
    }
    const payload = {
      code: edit.code.trim(),
      userId: edit.userId,
      roomId: edit.roomId,
      checkinDate: edit.checkinDate,
      checkoutDate: edit.checkoutDate,
      numGuests: edit.numGuests,
      status: edit.status,
      note: edit.note.trim() || '',
    }
    
    try {
      if (edit.id) {
        const response = await fetch('/api/system/bookings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: edit.id, ...payload })
        })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update booking')
        }
        await refetchBookings()
        setFlash({ type: 'success', text: 'Đã cập nhật đặt phòng.' })
      } else {
        const response = await fetch('/api/system/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create booking')
        }
        await refetchBookings()
        setFlash({ type: 'success', text: 'Đã tạo đặt phòng mới.' })
      }
      setEditOpen(false)
    } catch (error: any) {
      setFlash({ type: 'error', text: error.message || 'Có lỗi xảy ra' })
    }
  }

  function confirmAction(id: number, type: 'approve' | 'reject' | 'checkin' | 'delete') {
    setConfirmOpen({ open: true, id, type })
  }

  async function doAction() {
    if (!confirmOpen.id || !confirmOpen.type) return
    const { id, type } = confirmOpen
    
    try {
      if (type === 'delete') {
        const response = await fetch(`/api/system/bookings?id=${id}`, { method: 'DELETE' })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to delete booking')
        }
        await refetchBookings()
        setFlash({ type: 'success', text: 'Đã xóa đặt phòng.' })
      } else if (type === 'approve') {
        const response = await fetch(`/api/system/bookings?action=approve&id=${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to approve booking')
        }
        await refetchBookings()
        setFlash({ type: 'success', text: 'Đã duyệt đặt phòng.' })
      } else if (type === 'checkin') {
        const response = await fetch(`/api/system/bookings?action=checkin&id=${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to check-in booking')
        }
        await refetchBookings()
        setFlash({ type: 'success', text: 'Đã check-in thành công.' })
      } else {
        // Reject - now use PUT
        const response = await fetch('/api/system/bookings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: 'REJECTED' })
        })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to reject booking')
        }
        await refetchBookings()
        setFlash({ type: 'success', text: 'Đã từ chối đặt phòng.' })
      }
    } catch (error: any) {
      setFlash({ type: 'error', text: error.message || 'Có lỗi xảy ra' })
    }
    
    setConfirmOpen({ open: false })
  }

  function renderStatusChip(s: BookingStatus) {
    if (s === 'PENDING') return <Badge tone="warning">PENDING</Badge>
    if (s === 'APPROVED') return <Badge tone="success">APPROVED</Badge>
    if (s === 'REJECTED') return <Badge tone="error">REJECTED</Badge>
    if (s === 'CANCELLED') return <Badge tone="muted">CANCELLED</Badge>
    if (s === 'CHECKED_IN') return <Badge tone="info">CHECKED_IN</Badge>
    return <Badge tone="success">CHECKED_OUT</Badge>
  }

  const getRoomName = (roomId: number) => {
    const room = rooms.find(r => r.id === roomId)
    return room ? `${room.code} - ${room.name || ''}` : `Room ${roomId}`
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Đặt phòng</h1>
              <p className="text-sm lg:text-base text-gray-600 mt-1">Quản lý các đặt phòng trong hệ thống</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={openCreate}>
                Thêm đặt phòng mới
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Flash Messages */}
          {flash && (
            <div className={`rounded-md border p-2 sm:p-3 text-xs sm:text-sm shadow-sm ${
              flash.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {flash.text}
            </div>
          )}

          {/* Filters */}
          <Card>
  <CardBody className="p-4">
    <div className="flex flex-wrap items-end gap-4">
      {/* Tìm kiếm */}
      <div className="flex flex-col flex-1 min-w-[280px]">
        <label className="text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
        <Input
          placeholder="Tìm theo code, tên khách, phòng..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Từ ngày */}
      <div className="flex flex-col w-[150px]">
        <label className="text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Đến ngày */}
      <div className="flex flex-col w-[150px]">
        <label className="text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Sắp xếp */}
      <div className="flex flex-col w-[140px]">
        <label className="text-sm font-medium text-gray-700 mb-1">Sắp xếp</label>
        <select
          value={sortKey}
          onChange={(e) =>
            setSortKey(e.target.value as 'id' | 'code' | 'checkin' | 'checkout')
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="code">Code</option>
          <option value="checkin">Check-in</option>
          <option value="checkout">Check-out</option>
        </select>
      </div>

      {/* Thứ tự */}
      <div className="flex flex-col w-[120px]">
        <label className="text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="asc">Tăng dần</option>
          <option value="desc">Giảm dần</option>
        </select>
      </div>

      {/* Trạng thái */}
      <div className="flex flex-col w-[180px]">
        <label className="text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as 'ALL' | BookingStatus)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Tất cả trạng thái</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </div>
  </CardBody>
</Card>



          {/* Table */}
          <Card>
            <CardHeader>
              <div className="text-xs sm:text-sm text-gray-600">Tổng: {filtered.length} đặt phòng</div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-[800px] w-full table-fixed text-xs sm:text-sm">
                  <colgroup>
                    <col className="w-[15%]" />
                    <col className="w-[20%]" />
                    <col className="w-[15%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[8%]" />
                    <col className="w-[10%]" />
                    <col className="w-[8%]" />
                  </colgroup>
                  <thead>
                    <tr className="bg-gray-200 text-gray-700 text-xs sm:text-sm">
                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Code</th>
                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Khách hàng</th>
                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Phòng</th>
                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Check-in</th>
                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Check-out</th>
                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Số khách</th>
                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Trạng thái</th>
                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice((page - 1) * size, page * size).map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium">{row.code}</td>
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">{row.userName || `User ${row.userId}`}</td>
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">{getRoomName(row.roomId)}</td>
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">{row.checkinDate}</td>
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">{row.checkoutDate}</td>
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">{row.numGuests}</td>
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2">{renderStatusChip(row.status)}</td>
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2">
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-end">
                            <Button
                              variant="secondary"
                              className="h-6 sm:h-8 px-2 sm:px-3 text-xs"
                              onClick={() => {
                                setSelected(row)
                                setDetailOpen(true)
                              }}
                            >
                              Xem
                            </Button>
                            <Button
                              className="h-6 sm:h-8 px-2 sm:px-3 text-xs"
                              onClick={() => openEdit(row)}
                            >
                              Sửa
                            </Button>
                            {row.status === 'PENDING' && (
                              <>
                                <Button
                                  variant="primary"
                                  className="h-6 sm:h-8 px-2 sm:px-3 text-xs"
                                  onClick={() => confirmAction(row.id, 'approve')}
                                >
                                  Duyệt
                                </Button>
                                <Button
                                  variant="danger"
                                  className="h-6 sm:h-8 px-2 sm:px-3 text-xs"
                                  onClick={() => confirmAction(row.id, 'reject')}
                                >
                                  Từ chối
                                </Button>
                              </>
                            )}
                            {row.status === 'APPROVED' && (
                              <Button
                                variant="primary"
                                className="h-6 sm:h-8 px-2 sm:px-3 text-xs"
                                onClick={() => confirmAction(row.id, 'checkin')}
                              >
                                Check-in
                              </Button>
                            )}
                            <Button
                              variant="danger"
                              className="h-6 sm:h-8 px-2 sm:px-3 text-xs"
                              onClick={() => confirmAction(row.id, 'delete')}
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

              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span>Hàng:</span>
                  <select
                    className="h-7 sm:h-8 rounded-md border border-gray-300 bg-white px-2 text-xs sm:text-sm"
                    value={size}
                    onChange={(e) => { setPage(1); setSize(parseInt(e.target.value, 10)); }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-gray-500">trên {filtered.length}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button variant="secondary" className="h-7 sm:h-8 px-2 sm:px-3 text-xs" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Trước</Button>
                  <span className="px-2 text-xs sm:text-sm">Trang {page} / {Math.max(1, Math.ceil(filtered.length / size))}</span>
                  <Button variant="secondary" className="h-7 sm:h-8 px-2 sm:px-3 text-xs" disabled={page >= Math.ceil(filtered.length / size)} onClick={() => setPage((p) => Math.min(Math.ceil(filtered.length / size), p + 1))}>Sau</Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết đặt phòng">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Chi tiết đặt phòng</h2>
          {selected && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ID</label>
                <p className="mt-1 text-sm text-gray-900">{selected.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Code</label>
                <p className="mt-1 text-sm text-gray-900">{selected.code}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Khách hàng</label>
                <p className="mt-1 text-sm text-gray-900">{selected.userName || `User ${selected.userId}`}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phòng</label>
                <p className="mt-1 text-sm text-gray-900">{getRoomName(selected.roomId)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Check-in</label>
                <p className="mt-1 text-sm text-gray-900">{selected.checkinDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Check-out</label>
                <p className="mt-1 text-sm text-gray-900">{selected.checkoutDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Số khách</label>
                <p className="mt-1 text-sm text-gray-900">{selected.numGuests}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                <div className="mt-1">{renderStatusChip(selected.status)}</div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                <p className="mt-1 text-sm text-gray-900">{selected.note || '-'}</p>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={edit.id ? 'Sửa đặt phòng' : 'Thêm đặt phòng mới'}>
        <div className="p-6">
      
          <div className="space-y-6">
            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                <Input
                  value={edit.code}
                  onChange={(e) => setEdit({ ...edit, code: e.target.value })}
                  placeholder="Nhập code đặt phòng"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số khách *</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={edit.numGuests}
                  onChange={(e) => setEdit({ ...edit, numGuests: Number(e.target.value) })}
                  placeholder="Số lượng khách"
                  className="w-full"
                />
              </div>
            </div>

            {/* Thông tin khách hàng và phòng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID *</label>
                <Input
                  type="number"
                  min="1"
                  value={edit.userId}
                  onChange={(e) => setEdit({ ...edit, userId: Number(e.target.value) })}
                  placeholder="Nhập User ID"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">ID của khách hàng đặt phòng</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phòng *</label>
                <select
                  value={edit.roomId}
                  onChange={(e) => setEdit({ ...edit, roomId: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn phòng</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>{room.code} - {room.name || 'Phòng'}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ngày check-in và check-out */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày check-in *</label>
                <Input
                  type="date"
                  value={edit.checkinDate}
                  onChange={(e) => setEdit({ ...edit, checkinDate: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày check-out *</label>
                <Input
                  type="date"
                  value={edit.checkoutDate}
                  onChange={(e) => setEdit({ ...edit, checkoutDate: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>

            {/* Trạng thái và ghi chú */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={edit.status}
                  onChange={(e) => setEdit({ ...edit, status: e.target.value as BookingStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  value={edit.note}
                  onChange={(e) => setEdit({ ...edit, note: e.target.value })}
                  placeholder="Nhập ghi chú (tùy chọn)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={save}>
              {edit.id ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal open={confirmOpen.open} onClose={() => setConfirmOpen({ open: false })} title={confirmOpen.type === 'approve' && 'Xác nhận duyệt' || confirmOpen.type === 'reject' && 'Xác nhận từ chối' || confirmOpen.type === 'checkin' && 'Xác nhận check-in' || 'Xác nhận xóa'}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {confirmOpen.type === 'approve' && 'Xác nhận duyệt'}
            {confirmOpen.type === 'reject' && 'Xác nhận từ chối'}
            {confirmOpen.type === 'checkin' && 'Xác nhận check-in'}
            {confirmOpen.type === 'delete' && 'Xác nhận xóa'}
          </h2>
          <p className="text-gray-600 mb-6">
            {confirmOpen.type === 'approve' && 'Bạn có chắc chắn muốn duyệt đặt phòng này không?'}
            {confirmOpen.type === 'reject' && 'Bạn có chắc chắn muốn từ chối đặt phòng này không?'}
            {confirmOpen.type === 'checkin' && 'Bạn có chắc chắn muốn check-in cho đặt phòng này không?'}
            {confirmOpen.type === 'delete' && 'Bạn có chắc chắn muốn xóa đặt phòng này không?'}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmOpen({ open: false })}>
              Hủy
            </Button>
            <Button 
              variant={confirmOpen.type === 'delete' ? 'danger' : confirmOpen.type === 'reject' ? 'danger' : 'primary'} 
              onClick={doAction}
            >
              {confirmOpen.type === 'approve' && 'Duyệt'}
              {confirmOpen.type === 'reject' && 'Từ chối'}
              {confirmOpen.type === 'checkin' && 'Check-in'}
              {confirmOpen.type === 'delete' && 'Xóa'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}