"use client";

import { useEffect, useMemo, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";

import { type Service } from '@/lib/types'
import { useServices } from '@/hooks/useApi'

export default function ServicesPage() {
  const [rows, setRows] = useState<Service[]>([])
  const { data: servicesData, refetch: refetchServices } = useServices()
  const [flash, setFlash] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState<'code' | 'name' | 'price'>("code")
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("asc")
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)

  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Service | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [edit, setEdit] = useState<{ id?: number, code: string, name: string, unitPrice: number, unitName: string, description: string, isActive: boolean }>({ code: '', name: '', unitPrice: 0, unitName: '', description: '', isActive: true })
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean, id?: number }>({ open: false })

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
    if (servicesData) setRows(servicesData as Service[])
  }, [servicesData])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q ? rows.filter(r => 
      r.code.toLowerCase().includes(q) || 
      r.name.toLowerCase().includes(q) || 
      (r.description || '').toLowerCase().includes(q) || 
      r.unitName.toLowerCase().includes(q)
    ) : rows
    const dir = sortOrder === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      if (sortKey === 'code') return a.code.localeCompare(b.code) * dir
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir
      return (a.unitPrice - b.unitPrice) * dir
    })
  }, [rows, query, sortKey, sortOrder])

  function openCreate() {
    setEdit({ code: '', name: '', unitPrice: 0, unitName: '', description: '', isActive: true })
    setEditOpen(true)
  }

  function openEdit(s: Service) {
    setEdit({ 
      id: s.id, 
      code: s.code, 
      name: s.name, 
      unitPrice: s.unitPrice, 
      unitName: s.unitName, 
      description: s.description || '', 
      isActive: s.isActive 
    })
    setEditOpen(true)
  }

  async function save() {
    if (!edit.code.trim() || !edit.name.trim()) {
      setFlash({ type: 'error', text: 'Vui lòng nhập Code và Tên dịch vụ.' })
      return
    }
    if (edit.unitPrice < 0) {
      setFlash({ type: 'error', text: 'Giá dịch vụ không được âm.' })
      return
    }
    const payload = {
      code: edit.code.trim(),
      name: edit.name.trim(),
      unitPrice: edit.unitPrice,
      unitName: edit.unitName.trim(),
      description: edit.description.trim() || '',
      isActive: edit.isActive,
    }
    
    console.log('Saving service with payload:', payload)
    console.log('Edit state:', edit)
    
    try {
      if (edit.id) {
        const response = await fetch('/api/system/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: edit.id, ...payload })
        })
        
        console.log('PUT response status:', response.status)
        console.log('PUT response ok:', response.ok)
        
        if (!response.ok) {
          const errorData = await response.json()
          console.log('PUT error data:', errorData)
          setFlash({ type: 'error', text: errorData.error || 'Có lỗi xảy ra khi cập nhật dịch vụ.' })
          return
        }
        
        const responseData = await response.json()
        console.log('PUT success data:', responseData)
        
        await refetchServices()
        setFlash({ type: 'success', text: 'Đã cập nhật dịch vụ.' })
      } else {
        const response = await fetch('/api/system/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          setFlash({ type: 'error', text: errorData.error || 'Có lỗi xảy ra khi tạo dịch vụ mới.' })
          return
        }
        
        await refetchServices()
        setFlash({ type: 'success', text: 'Đã tạo dịch vụ mới.' })
      }
      setEditOpen(false)
    } catch (error) {
      console.error('Error saving service:', error)
      setFlash({ type: 'error', text: 'Có lỗi xảy ra khi lưu dịch vụ. Vui lòng thử lại.' })
    }
  }

  function confirmDelete(id: number) {
    setConfirmOpen({ open: true, id })
  }

  async function doDelete() {
    if (!confirmOpen.id) return
    await fetch(`/api/system/services?id=${confirmOpen.id}`, { method: 'DELETE' })
    await refetchServices()
    setConfirmOpen({ open: false })
    setFlash({ type: 'success', text: 'Đã xóa dịch vụ.' })
  }

  function renderActiveChip(isActive: boolean) {
    return isActive ? <Badge tone="success">ACTIVE</Badge> : <Badge tone="muted">INACTIVE</Badge>
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dịch vụ</h1>
              <p className="text-sm lg:text-base text-gray-600 mt-1">Theo dõi và quản lý các dịch vụ trong hệ thống</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={openCreate}>Thêm dịch vụ mới</Button>
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
          <div className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Cột 1: Tìm kiếm - 5/12 */}
              <div className="lg:col-span-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                <Input
                  placeholder="Tìm kiếm theo code, tên dịch vụ..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {/* Cột 2: Sắp xếp + Thứ tự - 3/12 */}
              <div className="lg:col-span-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp theo</label>
                    <select
                      value={sortKey}
                      onChange={(e) => setSortKey(e.target.value as 'code' | 'name' | 'price')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="code">Code</option>
                      <option value="name">Tên</option>
                      <option value="price">Giá</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="asc">Tăng dần</option>
                      <option value="desc">Giảm dần</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Cột 3: Trống - 4/12 */}
              <div className="lg:col-span-4"></div>
            </div>
          </div>

          {/* Table */}
          <Card>
            <CardHeader>
              <div className="text-xs sm:text-sm text-gray-600">Tổng: {filtered.length} dịch vụ</div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-[600px] w-full table-fixed text-xs sm:text-sm">
                  <colgroup>
                    <col className="w-[15%]" />
                    <col className="w-[20%]" />
                    <col className="w-[15%]" />
                    <col className="w-[12%]" />
                    <col className="w-[15%]" />
                    <col className="w-[23%]" />
                  </colgroup>
                  <thead>
                    <tr className="bg-gray-200 text-gray-700 text-xs sm:text-sm">
                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-center font-semibold">Code</th>
                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-center font-semibold">Tên dịch vụ</th>
                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-center font-semibold">Giá</th>
                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-center font-semibold">Đơn vị</th>
                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-center font-semibold">Trạng thái</th>
                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-center font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice((page - 1) * size, page * size).map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-center">{row.code}</td>
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-center">{row.name}</td>
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-center">{row.unitPrice.toLocaleString('vi-VN')} VND</td>
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-center">{row.unitName}</td>
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-center">{renderActiveChip(row.isActive)}</td>
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-center">
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center">
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
                            <Button
                              variant="danger"
                              className="h-6 sm:h-8 px-2 sm:px-3 text-xs"
                              onClick={() => confirmDelete(row.id)}
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

              {/* Pagination */}
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
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết dịch vụ">
        <div className="p-6">
          {selected && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{selected.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{selected.code}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên dịch vụ</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{selected.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{selected.unitPrice.toLocaleString('vi-VN')} VND</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{selected.unitName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <div className="mt-1">{renderActiveChip(selected.isActive)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md min-h-[60px]">{selected.description || '-'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={edit.id ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'}>
        <div className="p-6">
          
          <div className="space-y-6">
            {/* Thông tin cơ bản */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cơ bản</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <Input
                    value={edit.code}
                    onChange={(e) => setEdit({ ...edit, code: e.target.value })}
                    placeholder="Nhập code dịch vụ"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên dịch vụ *</label>
                  <Input
                    value={edit.name}
                    onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                    placeholder="Nhập tên dịch vụ"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Thông tin giá và đơn vị */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin giá và đơn vị</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá dịch vụ *</label>
                  <Input
                    type="number"
                    min="0"
                    value={edit.unitPrice}
                    onChange={(e) => {
                      const newPrice = Number(e.target.value)
                      console.log('Price input changed:', e.target.value, '->', newPrice)
                      setEdit({ ...edit, unitPrice: newPrice })
                    }}
                    placeholder="Nhập giá dịch vụ"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị *</label>
                  <Input
                    value={edit.unitName}
                    onChange={(e) => setEdit({ ...edit, unitName: e.target.value })}
                    placeholder="Nhập đơn vị (lần, kg, giờ...)"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Trạng thái và mô tả */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Trạng thái và mô tả</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái *</label>
                  <select
                    value={edit.isActive ? 'true' : 'false'}
                    onChange={(e) => setEdit({ ...edit, isActive: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">ACTIVE</option>
                    <option value="false">INACTIVE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={edit.description}
                    onChange={(e) => setEdit({ ...edit, description: e.target.value })}
                    placeholder="Nhập mô tả dịch vụ"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={save}>
              {edit.id ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={confirmOpen.open} onClose={() => setConfirmOpen({ open: false })} title="Xác nhận xóa">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Xác nhận xóa</h2>
          <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa dịch vụ này không?</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmOpen({ open: false })}>
              Hủy
            </Button>
            <Button variant="danger" onClick={doDelete}>
              Xóa
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
