"use client";

import { useEffect, useMemo, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";

import { mockServices, type Service } from '@/lib/mock-data'

export default function ServicesPage() {
  const [rows, setRows] = useState<Service[]>([])
  const [flash, setFlash] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState<'id' | 'code' | 'name' | 'price'>("code")
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("asc")
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)

  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Service | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [edit, setEdit] = useState<{ id?: number, code: string, name: string, price: string, unit: string, description: string, active: boolean }>({ code: '', name: '', price: '', unit: '', description: '', active: true })
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean, id?: number }>({ open: false })

  // Initialize data on client side only to avoid hydration issues
  useEffect(() => {
    setRows(mockServices)
  }, [])

  useEffect(() => { if (!flash) return; const t = setTimeout(() => setFlash(null), 3000); return () => clearTimeout(t) }, [flash])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q ? rows.filter(r => r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || (r.description||'').toLowerCase().includes(q) || r.unit_name.toLowerCase().includes(q)) : rows
    const dir = sortOrder === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      if (sortKey === 'id') return (a.id - b.id) * dir
      if (sortKey === 'code') return a.code.localeCompare(b.code) * dir
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir
      return (a.unit_price - b.unit_price) * dir
    })
  }, [rows, query, sortKey, sortOrder])

  function openCreate() {
    setEdit({ code: '', name: '', price: '', unit: '', description: '', active: true })
    setEditOpen(true)
  }
  function openEditRow(r: Service) {
    setEdit({ id: r.id, code: r.code, name: r.name, price: String(r.unit_price), unit: r.unit_name, description: r.description || '', active: r.is_active })
    setEditOpen(true)
  }
  function save() {
    if (!edit.code.trim() || !edit.name.trim() || !edit.unit.trim() || !edit.price || isNaN(Number(edit.price))) {
      setFlash({ type: 'error', text: 'Vui lòng nhập Code, Tên, Đơn vị và Giá hợp lệ.' })
      return
    }
    const payload: Service = {
      id: edit.id ?? (rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1),
      code: edit.code.trim(),
      name: edit.name.trim(),
      unit_price: Number(edit.price),
      unit_name: edit.unit.trim(),
      description: edit.description.trim() || undefined,
      is_active: edit.active,
    }
    if (edit.id) { setRows(rs => rs.map(r => r.id === edit.id ? payload : r)); setFlash({ type: 'success', text: 'Đã cập nhật dịch vụ.' }) }
    else { setRows(rs => [...rs, payload]); setFlash({ type: 'success', text: 'Đã tạo dịch vụ mới.' }) }
    setEditOpen(false)
  }
  function confirmDelete(id: number) { setConfirmOpen({ open: true, id }) }
  function doDelete() { if (!confirmOpen.id) return; setRows(rs => rs.filter(r => r.id !== confirmOpen.id)); setConfirmOpen({ open: false }); setFlash({ type: 'success', text: 'Đã xóa dịch vụ.' }) }

  function renderActiveBadge(a: boolean) { return a ? <Badge tone="success">Đang dùng</Badge> : <Badge tone="muted">Tạm dừng</Badge> }

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Quản lý dịch vụ</h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">Theo dõi và quản lý các dịch vụ trong hệ thống</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button className="h-8 sm:h-9 px-3 sm:px-4 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-xs sm:text-sm whitespace-nowrap" onClick={openCreate}>
              Tạo dịch vụ
            </Button>
            <button
              type="button"
              aria-label="Xuất Excel"
              title="Xuất Excel"
              className="h-8 sm:h-9 px-2 sm:px-3 rounded-md border border-gray-300 bg-white text-xs sm:text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              onClick={() => {
                const csv = [['ID', 'Code', 'Tên', 'Giá', 'Đơn vị', 'Mô tả'], ...filtered.map(s => [s.id, s.code, s.name, s.unit_price, s.unit_name, s.description || ''])]
                const blob = new Blob([csv.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `services_${new Date().toISOString().slice(0,10)}.xlsx`
                a.click()
                URL.revokeObjectURL(url)
              }}
            >
              Xuất excel
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <Input 
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm" 
              placeholder="Tìm theo code, tên, đơn vị..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Sắp xếp</label>
            <div className="flex gap-2">
              <select 
                className="h-8 sm:h-9 rounded-md border border-gray-300 bg-white px-2 sm:px-3 text-xs sm:text-sm flex-1" 
                value={sortKey} 
                onChange={(e) => setSortKey(e.target.value as any)}
              >
                <option value="code">Code</option>
                <option value="name">Tên</option>
                <option value="price">Giá</option>
                <option value="id">ID</option>
              </select>
              <select 
                className="h-8 sm:h-9 rounded-md border border-gray-300 bg-white px-2 sm:px-3 text-xs sm:text-sm flex-1" 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value as any)}
              >
                <option value="asc">Tăng dần</option>
                <option value="desc">Giảm dần</option>
              </select>
            </div>
          </div>
        </div>

      <Card>
        <CardHeader>
          <div className="text-xs sm:text-sm text-gray-600">Tổng: {filtered.length} dịch vụ</div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full table-fixed text-xs sm:text-sm">
            <colgroup>
              <col className="w-[5%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[15%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead>
              <tr className="bg-gray-200 text-gray-700 text-xs sm:text-sm">
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">ID</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Code</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Tên</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Giá</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Đơn vị</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Mô tả</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Trạng thái</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice((page - 1) * size, (page - 1) * size + size).map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2 whitespace-nowrap">{r.id}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span role="button" tabIndex={0} className="cursor-pointer underline underline-offset-2 text-blue-600 hover:text-blue-700 text-sm" onClick={() => { setSelected(r); setDetailOpen(true); }}>{r.code}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.name}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {r.unit_price === 0 ? (
                      <Badge tone="success">Miễn phí</Badge>
                    ) : (
                      <span>{r.unit_price.toLocaleString('vi-VN')} ₫</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.unit_name}</td>
                  <td className="px-3 py-2 text-gray-600 truncate max-w-[260px] sm:max-w-[360px]" title={r.description}>{r.description}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{renderActiveBadge(r.is_active)}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => openEditRow(r)}>Sửa</Button>
                      <Button variant="danger" onClick={() => confirmDelete(r.id)}>Xóa</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span>Hàng:</span>
              <select className="h-8 rounded-md border border-gray-300 bg-white px-2" value={size} onChange={(e) => { setPage(1); setSize(parseInt(e.target.value, 10)); }}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-gray-500">trên {filtered.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" className="h-8 px-3" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Trước</Button>
              <span className="px-2">Trang {page} / {Math.max(1, Math.ceil(filtered.length / size))}</span>
              <Button variant="secondary" className="h-8 px-3" disabled={page >= Math.ceil(filtered.length / size)} onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / size), p + 1))}>Sau</Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Modal chi tiết */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết dịch vụ">
        {selected ? (
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">ID:</span> {selected.id}</div>
            <div><span className="font-medium">Code:</span> {selected.code}</div>
            <div><span className="font-medium">Tên:</span> {selected.name}</div>
            <div><span className="font-medium">Giá:</span> {selected.unit_price === 0 ? 'Miễn phí' : `${selected.unit_price.toLocaleString('vi-VN')} ₫`}/{selected.unit_name}</div>
            <div><span className="font-medium">Trạng thái:</span> {selected.is_active ? 'Đang dùng' : 'Tạm dừng'}</div>
            <div><span className="font-medium">Mô tả:</span> {selected.description || '—'}</div>
          </div>
        ) : null}
      </Modal>

      {/* Modal tạo/sửa */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={edit.id ? 'Sửa dịch vụ' : 'Tạo dịch vụ'}
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
              {!edit.code.trim() && <div className="mt-1 text-xs text-red-600">Code bắt buộc.</div>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tên</label>
              <Input value={edit.name} onChange={(e) => setEdit((f) => ({ ...f, name: e.target.value }))} />
              {!edit.name.trim() && <div className="mt-1 text-xs text-red-600">Tên bắt buộc.</div>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Giá (₫)</label>
              <Input value={edit.price} onChange={(e) => setEdit((f) => ({ ...f, price: e.target.value }))} />
              {(!edit.price || isNaN(Number(edit.price))) && <div className="mt-1 text-xs text-red-600">Giá hợp lệ bắt buộc.</div>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Đơn vị</label>
              <Input value={edit.unit} onChange={(e) => setEdit((f) => ({ ...f, unit: e.target.value }))} />
              {!edit.unit.trim() && <div className="mt-1 text-xs text-red-600">Đơn vị bắt buộc.</div>}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Mô tả</label>
            <Input value={edit.description} onChange={(e) => setEdit((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2">
            <input id="active" type="checkbox" className="h-4 w-4" checked={edit.active} onChange={(e) => setEdit((f) => ({ ...f, active: e.target.checked }))} />
            <label htmlFor="active" className="text-sm">Đang dùng</label>
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
        <div className="text-sm text-gray-700">Bạn có chắc muốn xóa dịch vụ này?        </div>
      </Modal>
      </div>
    </>
  );
}



