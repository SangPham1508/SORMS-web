"use client";

import { useEffect, useMemo, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";

import { mockServiceOrders, mockServices, type ServiceOrder, type Service } from '@/lib/mock-data'

type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

type ServiceOrderItem = {
  id: number
  service_name: string
  quantity: number
  unit_price: number
}

export default function ServiceOrdersPage() {
  const [rows, setRows] = useState<ServiceOrder[]>(mockServiceOrders)
  const [flash, setFlash] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [query, setQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<'ALL' | OrderStatus>('ALL')
  const [sortKey, setSortKey] = useState<'id' | 'code' | 'customer' | 'created' | 'total'>("created")
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("desc")
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)

  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<ServiceOrder | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [edit, setEdit] = useState<{ id?: number, code: string, customer_name: string, room_code: string, created_at: string, total_price: string, status: OrderStatus, note: string, items: ServiceOrderItem[], item_service_id: string, item_name: string, item_qty: string, item_price: string }>({ code: '', customer_name: '', room_code: '', created_at: '', total_price: '', status: 'PENDING', note: '', items: [], item_service_id: '', item_name: '', item_qty: '', item_price: '' })
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean, id?: number } >({ open: false })

  useEffect(() => { if (!flash) return; const t = setTimeout(() => setFlash(null), 3000); return () => clearTimeout(t) }, [flash])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = rows.filter(r => r.code.toLowerCase().includes(q) || r.customer_name.toLowerCase().includes(q) || (r.room_code||'').toLowerCase().includes(q) || (r.items||[]).some(i => i.service_name.toLowerCase().includes(q)))
    if (filterStatus !== 'ALL') list = list.filter(r => r.status === filterStatus)
    const dir = sortOrder === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      if (sortKey === 'id') return (a.id - b.id) * dir
      if (sortKey === 'code') return a.code.localeCompare(b.code) * dir
      if (sortKey === 'customer') return a.customer_name.localeCompare(b.customer_name) * dir
      if (sortKey === 'total') return (a.total_amount - b.total_amount) * dir
      return a.created_at.localeCompare(b.created_at) * dir
    })
  }, [rows, query, filterStatus, sortKey, sortOrder])

  function openCreate() {
    setEdit({ code: '', customer_name: '', room_code: '', created_at: '', total_price: '', status: 'PENDING', note: '', items: [], item_service_id: '', item_name: '', item_qty: '', item_price: '' })
    setEditOpen(true)
  }
  function openEditRow(r: ServiceOrder) {
    setEdit({ id: r.id, code: r.code, customer_name: r.customer_name, room_code: r.room_code || '', created_at: r.created_at.slice(0,16), total_price: String(r.total_amount), status: r.status, note: r.note || '', items: r.items ? [...r.items] : [], item_service_id: '', item_name: '', item_qty: '', item_price: '' })
    setEditOpen(true)
  }

  function computeTotal(items: ServiceOrderItem[]): number {
    return items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0)
  }

  function handlePickService(id: string) {
    setEdit(e => {
      const picked = mockServices.find(s => String(s.id) === id)
      return { ...e, item_service_id: id, item_name: picked ? picked.name : '', item_price: picked ? String(picked.unit_price) : e.item_price }
    })
  }

  function addItem() {
    if (!edit.item_name.trim() || !edit.item_qty || isNaN(Number(edit.item_qty)) || !edit.item_price || isNaN(Number(edit.item_price))) return
    const newItem: ServiceOrderItem = {
      id: edit.items.length ? Math.max(...edit.items.map(i => i.id)) + 1 : 1,
      service_name: edit.item_name.trim(),
      quantity: Number(edit.item_qty),
      unit_price: Number(edit.item_price),
    }
    const items = [...edit.items, newItem]
    setEdit(e => ({ ...e, items, item_service_id: '', item_name: '', item_qty: '', item_price: '', total_price: String(computeTotal(items)) }))
  }
  function removeItem(id: number) {
    const items = edit.items.filter(i => i.id !== id)
    setEdit(e => ({ ...e, items, total_price: String(computeTotal(items)) }))
  }

  function save() {
    if (!edit.code.trim() || !edit.customer_name.trim() || !edit.created_at) {
      setFlash({ type: 'error', text: 'Vui lòng nhập Code, Khách, Ngày tạo.' })
      return
    }
    const finalTotal = edit.items.length ? computeTotal(edit.items) : (edit.total_price && !isNaN(Number(edit.total_price)) ? Number(edit.total_price) : 0)
    const payload: ServiceOrder = {
      id: edit.id ?? (rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1),
      code: edit.code.trim(),
      customer_name: edit.customer_name.trim(),
      room_code: edit.room_code.trim() || undefined,
      created_at: edit.created_at,
      total_amount: finalTotal,
      status: edit.status,
      note: edit.note.trim() || undefined,
      items: edit.items,
    }
    if (edit.id) { setRows(rs => rs.map(r => r.id === edit.id ? payload : r)); setFlash({ type: 'success', text: 'Đã cập nhật phiếu dịch vụ.' }) }
    else { setRows(rs => [...rs, payload]); setFlash({ type: 'success', text: 'Đã tạo phiếu dịch vụ mới.' }) }
    setEditOpen(false)
  }
  function confirmDelete(id: number) { setConfirmOpen({ open: true, id }) }
  function doDelete() { if (!confirmOpen.id) return; setRows(rs => rs.filter(r => r.id !== confirmOpen.id)); setConfirmOpen({ open: false }); setFlash({ type: 'success', text: 'Đã xóa phiếu dịch vụ.' }) }

  function renderStatusChip(s: OrderStatus) {
    if (s === 'COMPLETED') return <Badge tone="success">COMPLETED</Badge>
    if (s === 'CANCELLED') return <Badge tone="warning">CANCELLED</Badge>
    if (s === 'IN_PROGRESS') return <Badge>IN_PROGRESS</Badge>
    return <Badge tone="muted">PENDING</Badge>
  }

  function exportCsv() {
    const headers = ['ID','Code','Khach','Phong','NgayTao','TongTien','TrangThai','GhiChu','DichVu']
    const csv = [headers.join(','), ...filtered.map(r => [
      r.id,
      `"${r.code}"`,
      `"${r.customer_name}"`,
      `"${r.room_code || ''}"`,
      r.created_at,
      r.total_amount,
      r.status,
      `"${(r.note||'').replace(/"/g,'""')}"`,
      `"${(r.items||[]).map(i=>i.service_name).join('; ').replace(/"/g,'""')}"`
    ].join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `service_orders_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportSinglePdf(order: ServiceOrder) {
    const itemsRows = (order.items||[]).map(i => `<tr><td>${i.service_name}</td><td style=\"text-align:center\">${i.quantity}</td><td style=\"text-align:right\">${i.unit_price === 0 ? 'Miễn phí' : i.unit_price.toLocaleString('vi-VN') + ' ₫'}</td><td style=\"text-align:right\">${i.unit_price === 0 ? 'Miễn phí' : (i.quantity*i.unit_price).toLocaleString('vi-VN') + ' ₫'}</td></tr>`).join('')
    const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<title>Phiếu dịch vụ ${order.code}</title>
<style>
  body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; margin: 24px; color: #111827; }
  .header { display:flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .title { font-size: 20px; font-weight: 700; }
  .meta { font-size: 14px; color: #374151; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #E5E7EB; }
  .total { text-align: right; font-weight: 700; }
  .badge { display:inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; }
  .badge-success { background:#D1FAE5; color:#065F46; }
  .badge-warn { background:#FEF3C7; color:#92400E; }
  .badge-muted { background:#E5E7EB; color:#374151; }
  @media print { .no-print { display:none; } }
</style>
</head>
<body>
  <div class="header">
    <div class="title">Phiếu dịch vụ ${order.code}</div>
    <div class="meta">Ngày tạo: ${order.created_at.replace('T',' ')}</div>
  </div>
  <div class="meta">Khách: <b>${order.customer_name}</b></div>
  <div class="meta">Phòng: <b>${order.room_code || '—'}</b></div>
  <div class="meta">Trạng thái: <span class="badge ${order.status==='COMPLETED' ? 'badge-success' : order.status==='CANCELLED' ? 'badge-warn' : 'badge-muted'}">${order.status}</span></div>
  <table>
    <thead>
      <tr><th>Dịch vụ</th><th style=\"text-align:center\">SL</th><th style=\"text-align:right\">Đơn giá</th><th style=\"text-align:right\">Thành tiền</th></tr>
    </thead>
    <tbody>
      ${itemsRows || '<tr><td colspan=\"4\" style=\"text-align:center\">(Không có dòng dịch vụ)</td></tr>'}
      <tr><td colspan=\"4\" class=\"total\">Tổng cộng: ${order.total_amount === 0 ? 'Miễn phí' : order.total_amount.toLocaleString('vi-VN') + ' ₫'}</td></tr>
    </tbody>
  </table>
  <div style="margin-top:24px" class="meta">Ghi chú: ${order.note || '—'}</div>
  <div class="no-print" style="margin-top:24px"><button onclick="window.print()" style="padding:8px 12px;border:1px solid #D1D5DB;border-radius:6px;background:#111827;color:white">In / Lưu PDF</button></div>
</body>
</html>`
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Quản lý phiếu dịch vụ</h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">Theo dõi và quản lý các phiếu dịch vụ trong hệ thống</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button className="h-8 sm:h-9 px-3 sm:px-4 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-xs sm:text-sm whitespace-nowrap" onClick={openCreate}>
              Tạo phiếu dịch vụ
            </Button>
            <button
              aria-label="Xuất Excel (CSV)"
              title="Xuất Excel (CSV)"
              className="h-8 sm:h-9 px-2 sm:px-3 rounded-md border border-gray-300 bg-white text-xs sm:text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              onClick={exportCsv}
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
            placeholder="Tìm theo code, khách, phòng, dịch vụ..." 
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
            <option value="PENDING">PENDING</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
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
            <option value="total">Tổng tiền</option>
            <option value="code">Code</option>
            <option value="customer">Khách</option>
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
          <div className="text-xs sm:text-sm text-gray-600">Tổng: {filtered.length} phiếu</div>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700">Khách</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700">Dịch vụ</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700">Phòng</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700">Ngày tạo</th>
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
                        title={r.customer_name}
                      >
                        {r.customer_name}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm truncate" title={(r.items||[]).map(i=>i.service_name).join(', ')}>
                      {(r.items||[]).map(i=>i.service_name).join(', ') || '—'}
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap">{r.room_code || '—'}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap">{r.created_at.replace('T',' ')}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">{renderStatusChip(r.status)}</td>
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
                        <Button 
                          variant="secondary" 
                          onClick={() => exportSinglePdf(r)}
                          className="h-6 sm:h-8 px-2 sm:px-3 text-xs"
                        >
                          PDF
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
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết phiếu dịch vụ">
        {selected ? (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="font-medium">ID:</span> {selected.id}</div>
              <div><span className="font-medium">Code:</span> {selected.code}</div>
              <div><span className="font-medium">Khách:</span> {selected.customer_name}</div>
              <div><span className="font-medium">Phòng:</span> {selected.room_code || '—'}</div>
              <div><span className="font-medium">Ngày tạo:</span> {selected.created_at.replace('T',' ')}</div>
              <div><span className="font-medium">Trạng thái:</span> {selected.status}</div>
            </div>
            <div>
              <div className="font-medium mb-1">Dịch vụ</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-600">
                    <th className="text-left py-1">Tên</th>
                    <th className="text-center py-1">SL</th>
                    <th className="text-right py-1">Đơn giá</th>
                    <th className="text-right py-1">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {(selected.items||[]).length ? (selected.items||[]).map(it => (
                    <tr key={it.id}>
                      <td className="py-1">{it.service_name}</td>
                      <td className="py-1 text-center">{it.quantity}</td>
                      <td className="py-1 text-right">
                        {it.unit_price === 0 ? (
                          <Badge tone="success">Miễn phí</Badge>
                        ) : (
                          <span>{it.unit_price.toLocaleString('vi-VN')} ₫</span>
                        )}
                      </td>
                      <td className="py-1 text-right">
                        {it.unit_price === 0 ? (
                          <Badge tone="success">Miễn phí</Badge>
                        ) : (
                          <span>{(it.quantity*it.unit_price).toLocaleString('vi-VN')} ₫</span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="py-2 text-center text-gray-500">(Không có dòng dịch vụ)</td></tr>
                  )}
                  <tr>
                    <td colSpan={4} className="py-2 text-right font-semibold">
                      Tổng cộng: {selected.total_amount === 0 ? 'Miễn phí' : `${selected.total_amount.toLocaleString('vi-VN')} ₫`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div><span className="font-medium">Ghi chú:</span> {selected.note || '—'}</div>
          </div>
        ) : null}
      </Modal>

      {/* Modal tạo/sửa */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={edit.id ? 'Sửa phiếu dịch vụ' : 'Tạo phiếu dịch vụ'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Hủy</Button>
            <Button onClick={save}>Lưu</Button>
          </div>
        }
        size='xl'
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Code</label>
              <Input value={edit.code} onChange={(e) => setEdit((f) => ({ ...f, code: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text.sm font-medium">Khách</label>
              <Input value={edit.customer_name} onChange={(e) => setEdit((f) => ({ ...f, customer_name: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Phòng</label>
              <Input value={edit.room_code} onChange={(e) => setEdit((f) => ({ ...f, room_code: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Ngày tạo</label>
              <Input type="datetime-local" value={edit.created_at} onChange={(e) => setEdit((f) => ({ ...f, created_at: e.target.value }))} />
            </div>
          </div>

          <div>
            <div className="font-medium mb-2">Dịch vụ trong phiếu</div>
            <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-2 items-center">
              <select className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm" value={edit.item_service_id} onChange={(e) => handlePickService(e.target.value)}>
                <option value="">Chọn dịch vụ...</option>
                {mockServices.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.unit_price === 0 ? 'Miễn phí' : `${s.unit_price.toLocaleString('vi-VN')} ₫`}/{s.unit_name}
                  </option>
                ))}
              </select>
              <Input placeholder="Tên dịch vụ" value={edit.item_name} onChange={(e) => setEdit(f => ({ ...f, item_name: e.target.value }))} />
              <Input placeholder="SL" value={edit.item_qty} onChange={(e) => setEdit(f => ({ ...f, item_qty: e.target.value }))} />
              <Input placeholder="Đơn giá" value={edit.item_price} onChange={(e) => setEdit(f => ({ ...f, item_price: e.target.value }))} />
              <Button onClick={addItem}>+</Button>
            </div>
            <table className="w-full text-sm mt-2">
              <thead>
                <tr className="text-gray-600">
                  <th className="text-left py-1">Tên</th>
                  <th className="text-center py-1">SL</th>
                  <th className="text-right py-1">Đơn giá</th>
                  <th className="text-right py-1">Thành tiền</th>
                  <th className="text-right py-1">Xóa</th>
                </tr>
              </thead>
              <tbody>
                {edit.items.length ? edit.items.map(it => (
                  <tr key={it.id}>
                    <td className="py-1">{it.service_name}</td>
                    <td className="py-1 text-center">{it.quantity}</td>
                    <td className="py-1 text-right">
                      {it.unit_price === 0 ? (
                        <Badge tone="success">Miễn phí</Badge>
                      ) : (
                        <span>{it.unit_price.toLocaleString('vi-VN')} ₫</span>
                      )}
                    </td>
                    <td className="py-1 text-right">
                      {it.unit_price === 0 ? (
                        <Badge tone="success">Miễn phí</Badge>
                      ) : (
                        <span>{(it.quantity*it.unit_price).toLocaleString('vi-VN')} ₫</span>
                      )}
                    </td>
                    <td className="py-1 text-right"><Button variant="danger" onClick={() => removeItem(it.id)}>Xóa</Button></td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="py-2 text-center text-gray-500">(Chưa có dòng dịch vụ)</td></tr>
                )}
                <tr>
                  <td colSpan={5} className="py-2 text-right font-semibold">
                    Tổng tạm tính: {computeTotal(edit.items) === 0 ? 'Miễn phí' : `${computeTotal(edit.items).toLocaleString('vi-VN')} ₫`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="mb-1 block text-sm font-medium">Trạng thái</label>
              <select className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" value={edit.status} onChange={(e) => setEdit((f) => ({ ...f, status: e.target.value as OrderStatus }))}>
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div className="text-right text-sm text-gray-700">
              <div className="font-medium">Tổng tiền sẽ được tính tự động từ dịch vụ.</div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Ghi chú</label>
            <Input value={edit.note} onChange={(e) => setEdit((f) => ({ ...f, note: e.target.value }))} />
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
        <div className="text-sm text-gray-700">Bạn có chắc muốn xóa phiếu dịch vụ này?</div>
      </Modal>
      </div>
    </>
  );
}



