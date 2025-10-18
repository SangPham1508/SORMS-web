"use client";

import { useEffect, useMemo, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";

type RoomType = {
  id: number
  code: string
  name: string
  description?: string
  base_price: number
  capacity: number
}

const mock: RoomType[] = [
  { id: 1, code: "STD", name: "Standard", description: "Phòng tiêu chuẩn", base_price: 350000, capacity: 2 },
  { id: 2, code: "DLX", name: "Deluxe", description: "Phòng cao cấp", base_price: 550000, capacity: 3 },
  { id: 3, code: "FAM", name: "Family", description: "Phòng gia đình", base_price: 750000, capacity: 4 },
]

export default function RoomTypesPage() {
  const [rows, setRows] = useState<RoomType[]>(mock)
  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState<"id" | "code" | "name">("code")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)

  const [flash, setFlash] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<RoomType | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [edit, setEdit] = useState<{ id?: number, code: string, name: string, base_price: string, capacity: string, description: string }>({ code: "", name: "", base_price: "", capacity: "", description: "" })
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean, id?: number }>({ open: false })

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(null), 3000)
    return () => clearTimeout(t)
  }, [flash])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? rows.filter(r => r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q))
      : rows
    const dir = sortOrder === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      if (sortKey === 'id') return (a.id - b.id) * dir
      if (sortKey === 'code') return a.code.localeCompare(b.code) * dir
      return a.name.localeCompare(b.name) * dir
    })
  }, [rows, query, sortKey, sortOrder])

  function openCreate() {
    setEdit({ code: "", name: "", base_price: "", capacity: "", description: "" })
    setEditOpen(true)
  }

  function openEdit(r: RoomType) {
    setEdit({ id: r.id, code: r.code, name: r.name, base_price: String(r.base_price), capacity: String(r.capacity), description: r.description || "" })
    setEditOpen(true)
  }

  function save() {
    if (!edit.code.trim() || !edit.name.trim() || !edit.base_price || isNaN(Number(edit.base_price)) || !edit.capacity || isNaN(Number(edit.capacity))) {
      setFlash({ type: 'error', text: 'Vui lòng nhập Code, Name và giá/sức chứa hợp lệ.' })
      return
    }
    const payload: RoomType = {
      id: edit.id ?? (rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1),
      code: edit.code.trim(),
      name: edit.name.trim(),
      base_price: Number(edit.base_price),
      capacity: Number(edit.capacity),
      description: edit.description.trim() || undefined,
    }
    if (edit.id) {
      setRows(rs => rs.map(r => r.id === edit.id ? payload : r))
      setFlash({ type: 'success', text: 'Đã cập nhật loại phòng.' })
    } else {
      setRows(rs => [...rs, payload])
      setFlash({ type: 'success', text: 'Đã tạo loại phòng mới.' })
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
    setFlash({ type: 'success', text: 'Đã xóa loại phòng.' })
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Quản lý loại phòng</h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">Theo dõi và quản lý các loại phòng trong hệ thống</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button className="h-8 sm:h-9 px-3 sm:px-4 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-xs sm:text-sm whitespace-nowrap" onClick={openCreate}>
              Tạo loại phòng
            </Button>
            <button
              type="button"
              aria-label="Xuất Excel"
              title="Xuất Excel"
              className="h-8 sm:h-9 px-2 sm:px-3 rounded-md border border-gray-300 bg-white text-xs sm:text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              onClick={() => {
                const csv = [['ID', 'Code', 'Tên', 'Giá cơ bản', 'Mô tả'], ...filtered.map(r => [r.id, r.code, r.name, r.base_price, r.description || ''])]
                const blob = new Blob([csv.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `room-types_${new Date().toISOString().slice(0,10)}.xlsx`
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
              placeholder="Tìm theo code, tên, mô tả..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Sắp xếp</label>
            <div className="flex gap-2">
              <select className="h-8 sm:h-9 rounded-md border border-gray-300 bg-white px-2 sm:px-3 text-xs sm:text-sm flex-1" value={sortKey} onChange={(e) => setSortKey(e.target.value as any)}>
                <option value="code">Code</option>
                <option value="name">Tên</option>
                <option value="id">ID</option>
                <option value="base_price">Giá cơ bản</option>
              </select>
              <select className="h-8 sm:h-9 rounded-md border border-gray-300 bg-white px-2 sm:px-3 text-xs sm:text-sm flex-1" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)}>
                <option value="asc">Tăng dần</option>
                <option value="desc">Giảm dần</option>
              </select>
            </div>
          </div>
        </div>

      <Card>
        <CardHeader>
          <div className="text-xs sm:text-sm text-gray-600">Tổng: {filtered.length} loại phòng</div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full table-fixed text-xs sm:text-sm">
            <colgroup>
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead>
              <tr className="bg-gray-200 text-gray-700 text-xs sm:text-sm">
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">ID</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Code</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Name</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Giá cơ bản</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Sức chứa</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Mô tả</th>
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
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap text-xs sm:text-sm">{r.name}</td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap text-xs sm:text-sm">{r.base_price.toLocaleString('vi-VN')} ₫</td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap text-xs sm:text-sm">{r.capacity}</td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-gray-600 truncate max-w-[180px] sm:max-w-[260px] lg:max-w-[360px] text-xs sm:text-sm" title={r.description}>{r.description}</td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <Button variant="secondary" className="h-6 sm:h-8 px-2 sm:px-3 text-xs" onClick={() => openEdit(r)}>Sửa</Button>
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

      {/* Modal chi tiết */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết loại phòng">
        {selected ? (
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">ID:</span> {selected.id}</div>
            <div><span className="font-medium">Code:</span> {selected.code}</div>
            <div><span className="font-medium">Name:</span> {selected.name}</div>
            <div><span className="font-medium">Giá cơ bản:</span> {selected.base_price.toLocaleString('vi-VN')} ₫</div>
            <div><span className="font-medium">Sức chứa:</span> {selected.capacity}</div>
            <div><span className="font-medium">Mô tả:</span> {selected.description || '—'}</div>
          </div>
        ) : null}
      </Modal>

      {/* Modal tạo/sửa */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={edit.id ? 'Sửa loại phòng' : 'Tạo loại phòng'}
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
            <label className="mb-1 block text-sm font-medium">Name</label>
            <Input value={edit.name} onChange={(e) => setEdit((f) => ({ ...f, name: e.target.value }))} />
            {!edit.name.trim() && <div className="mt-1 text-xs text-red-600">Name bắt buộc.</div>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Giá cơ bản (₫)</label>
              <Input value={edit.base_price} onChange={(e) => setEdit((f) => ({ ...f, base_price: e.target.value }))} />
              {(!edit.base_price || isNaN(Number(edit.base_price))) && <div className="mt-1 text-xs text-red-600">Giá hợp lệ bắt buộc.</div>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Sức chứa</label>
              <Input value={edit.capacity} onChange={(e) => setEdit((f) => ({ ...f, capacity: e.target.value }))} />
              {(!edit.capacity || isNaN(Number(edit.capacity))) && <div className="mt-1 text-xs text-red-600">Sức chứa hợp lệ bắt buộc.</div>}
            </div>
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
        <div className="text-sm text-gray-700">Bạn có chắc muốn xóa loại phòng này?        </div>
      </Modal>
      </div>
    </>
  );
}



