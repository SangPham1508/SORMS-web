"use client";

import { useEffect, useMemo, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";

type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'

type Payment = {
  id: number
  code: string
  order_code?: string
  payer_name: string
  method: 'Tiền Mặt' | 'Chuyển Khoản'
  amount: number
  created_at: string
  status: PaymentStatus
  note?: string
}

const mock: Payment[] = [
  { id: 1, code: 'PM-0001', order_code: 'SO-0001', payer_name: 'Nguyen Van A', method: 'Tiền Mặt', amount: 80000, created_at: '2025-10-19T11:00:00', status: 'SUCCESS' },
  { id: 2, code: 'PM-0002', order_code: 'SO-0002', payer_name: 'Tran Thi B', method: 'Chuyển Khoản', amount: 150000, created_at: '2025-10-18T15:20:00', status: 'PENDING' },
  { id: 3, code: 'PM-0003', order_code: 'SO-0003', payer_name: 'Le Van C', method: 'Tiền Mặt', amount: 50000, created_at: '2025-10-17T10:30:00', status: 'REFUNDED' },
]

export default function PaymentsPage() {
  const [rows, setRows] = useState<Payment[]>(mock)
  const [flash, setFlash] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [query, setQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<'ALL' | PaymentStatus>('ALL')
  const [sortKey, setSortKey] = useState<'id' | 'code' | 'created' | 'amount'>("created")
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("desc")
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)

  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Payment | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [edit, setEdit] = useState<{ id?: number, code: string, order_code: string, payer_name: string, method: Payment['method'], amount: string, created_at: string, status: PaymentStatus, note: string }>({ code: '', order_code: '', payer_name: '', method: 'Tiền Mặt', amount: '', created_at: '', status: 'PENDING', note: '' })
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean, id?: number }>({ open: false })

  useEffect(() => { if (!flash) return; const t = setTimeout(() => setFlash(null), 3000); return () => clearTimeout(t) }, [flash])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = rows.filter(r =>
      r.code.toLowerCase().includes(q) ||
      (r.order_code || '').toLowerCase().includes(q) ||
      r.payer_name.toLowerCase().includes(q)
    )
    if (filterStatus !== 'ALL') list = list.filter(r => r.status === filterStatus)
    const dir = sortOrder === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      if (sortKey === 'id') return (a.id - b.id) * dir
      if (sortKey === 'code') return a.code.localeCompare(b.code) * dir
      if (sortKey === 'amount') return (a.amount - b.amount) * dir
      return a.created_at.localeCompare(b.created_at) * dir
    })
  }, [rows, query, filterStatus, sortKey, sortOrder])

  function openCreate() {
    setEdit({ code: '', order_code: '', payer_name: '', method: 'Chuyển Khoản', amount: '', created_at: '', status: 'PENDING', note: '' })
    setEditOpen(true)
  }
  function openEditRow(r: Payment) {
    setEdit({ id: r.id, code: r.code, order_code: r.order_code || '', payer_name: r.payer_name, method: r.method, amount: String(r.amount), created_at: r.created_at.slice(0,16), status: r.status, note: r.note || '' })
    setEditOpen(true)
  }
  function save() {
    if (!edit.code.trim() || !edit.payer_name.trim() || !edit.created_at || !edit.amount || isNaN(Number(edit.amount))) {
      setFlash({ type: 'error', text: 'Vui lòng nhập Code, Người thanh toán, Ngày tạo và Số tiền hợp lệ.' })
      return
    }
    const payload: Payment = {
      id: edit.id ?? (rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1),
      code: edit.code.trim(),
      order_code: edit.order_code.trim() || undefined,
      payer_name: edit.payer_name.trim(),
      method: edit.method,
      amount: Number(edit.amount),
      created_at: edit.created_at,
      status: edit.status,
      note: edit.note.trim() || undefined,
    }
    if (edit.id) { setRows(rs => rs.map(r => r.id === edit.id ? payload : r)); setFlash({ type: 'success', text: 'Đã cập nhật giao dịch.' }) }
    else { setRows(rs => [...rs, payload]); setFlash({ type: 'success', text: 'Đã tạo giao dịch mới.' }) }
    setEditOpen(false)
  }
  function confirmDelete(id: number) { setConfirmOpen({ open: true, id }) }
  function doDelete() { if (!confirmOpen.id) return; setRows(rs => rs.filter(r => r.id !== confirmOpen.id)); setConfirmOpen({ open: false }); setFlash({ type: 'success', text: 'Đã xóa giao dịch.' }) }

  function renderStatusChip(s: PaymentStatus) {
    if (s === 'SUCCESS') return <Badge tone="success">SUCCESS</Badge>
    if (s === 'FAILED' || s === 'REFUNDED') return <Badge tone="warning">{s}</Badge>
    return <Badge>PENDING</Badge>
  }

  function exportCsv() {
    const headers = ['Code','NguoiThanhToan','PTTT','SoTien','NgayTao','TrangThai','GhiChu']
    const csv = [headers.join(','), ...filtered.map(r => [
      `"${r.code}"`,
      `"${r.payer_name}"`,
      r.method,
      r.amount,
      r.created_at,
      r.status,
      `"${(r.note||'').replace(/"/g,'""')}"`
    ].join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportInvoicePdf(p: Payment) {
    const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<title>Hóa đơn ${p.code}</title>
<style>
  body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; margin: 24px; color: #111827; }
  .header { display:flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .title { font-size: 20px; font-weight: 700; }
  .meta { font-size: 14px; color: #374151; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #E5E7EB; }
  .total { text-align: right; font-weight: 700; }
  @media print { .no-print { display:none; } }
</style>
</head>
<body>
  <div class="header">
    <div class="title">Hóa đơn thanh toán</div>
    <div class="meta">Mã: ${p.code}</div>
  </div>
  <div class="meta">Người thanh toán: <b>${p.payer_name}</b></div>
  <div class="meta">Phương thức: <b>${p.method}</b></div>
  <div class="meta">Ngày tạo: <b>${p.created_at.replace('T',' ')}</b></div>
  <table>
    <thead><tr><th>Nội dung</th><th class="total">Số tiền</th></tr></thead>
    <tbody>
      <tr><td>Thanh toán đơn dịch vụ${p.order_code ? ' ('+p.order_code+')' : ''}</td><td class="total">${p.amount.toLocaleString('vi-VN')} ₫</td></tr>
    </tbody>
  </table>
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Quản lý thanh toán</h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">Theo dõi và quản lý các giao dịch thanh toán</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button className="h-8 sm:h-9 px-3 sm:px-4 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-xs sm:text-sm whitespace-nowrap" onClick={openCreate}>
              Tạo giao dịch
            </Button>
            <button 
              type="button" 
              aria-label="Xuất Excel (CSV)" 
              title="Xuất Excel (CSV)" 
              className="h-8 sm:h-9 px-2 sm:px-3 rounded-md border border-gray-300 bg-white text-xs sm:text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap" 
              onClick={exportCsv}
            >
              📊 Xuất CSV
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
              placeholder="Tìm theo code, đơn hàng, người thanh toán..." 
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
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUNDED">REFUNDED</option>
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
              <option value="amount">Số tiền</option>
              <option value="code">Code</option>
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
          <div className="text-xs sm:text-sm text-gray-600">Tổng: {filtered.length} giao dịch</div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full table-fixed text-xs sm:text-sm">
              <colgroup>
                <col className="w-[10%]" />
                <col className="w-[15%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[15%]" />
                <col className="w-[10%]" />
                <col className="w-[15%]" />
              </colgroup>
              <thead>
                <tr className="bg-gray-200 text-gray-700 text-xs sm:text-sm">
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Code</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Người thanh toán</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">PTTT</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Số tiền</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Ngày tạo</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Trạng thái</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice((page - 1) * size, (page - 1) * size + size).map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2">
                      <span role="button" tabIndex={0} className="cursor-pointer underline underline-offset-2 text-blue-600 hover:text-blue-700 text-xs sm:text-sm" onClick={() => { setSelected(r); setDetailOpen(true); }}>{r.code}</span>
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 truncate max-w-[180px] sm:max-w-[260px] lg:max-w-[360px] text-xs sm:text-sm" title={r.payer_name}>{r.payer_name}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap text-xs sm:text-sm">{r.method}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap text-xs sm:text-sm">{r.amount.toLocaleString('vi-VN')} ₫</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap text-xs sm:text-sm">{r.created_at.replace('T',' ')}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {renderStatusChip(r.status)}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <Button variant="secondary" className="h-6 sm:h-8 px-2 sm:px-3 text-xs" onClick={() => openEditRow(r)}>Sửa</Button>
                        <Button variant="danger" className="h-6 sm:h-8 px-2 sm:px-3 text-xs" onClick={() => confirmDelete(r.id)}>Xóa</Button>
                        <Button variant="secondary" className="h-6 sm:h-8 px-2 sm:px-3 text-xs" onClick={() => exportInvoicePdf(r)}>PDF</Button>
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
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết giao dịch">
        {selected ? (
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Code:</span> {selected.code}</div>
            <div><span className="font-medium">Người thanh toán:</span> {selected.payer_name}</div>
            <div><span className="font-medium">PTTT:</span> {selected.method}</div>
            <div><span className="font-medium">Số tiền:</span> {selected.amount.toLocaleString('vi-VN')} ₫</div>
            <div><span className="font-medium">Ngày tạo:</span> {selected.created_at.replace('T',' ')}</div>
            <div><span className="font-medium">Trạng thái:</span> {selected.status}</div>
            <div><span className="font-medium">Ghi chú:</span> {selected.note || '—'}</div>
          </div>
        ) : null}
      </Modal>

      {/* Modal tạo/sửa */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={edit.id ? 'Sửa giao dịch' : 'Tạo giao dịch'}
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
              <label className="mb-1 block text-sm font-medium">Đơn (nếu có)</label>
              <Input value={edit.order_code} onChange={(e) => setEdit((f) => ({ ...f, order_code: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Người thanh toán</label>
              <Input value={edit.payer_name} onChange={(e) => setEdit((f) => ({ ...f, payer_name: e.target.value }))} />
              {!edit.payer_name.trim() && <div className="mt-1 text-xs text-red-600">Bắt buộc.</div>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Phương thức</label>
              <select className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" value={edit.method} onChange={(e) => setEdit((f) => ({ ...f, method: e.target.value as Payment['method'] }))}>
                <option value="Tiền Mặt">Tiền Mặt</option>
                <option value="Chuyển Khoản">Chuyển Khoản</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Số tiền (₫)</label>
              <Input value={edit.amount} onChange={(e) => setEdit((f) => ({ ...f, amount: e.target.value }))} />
              {(!edit.amount || isNaN(Number(edit.amount))) && <div className="mt-1 text-xs text-red-600">Số tiền hợp lệ bắt buộc.</div>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Ngày tạo</label>
              <Input type="datetime-local" value={edit.created_at} onChange={(e) => setEdit((f) => ({ ...f, created_at: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Trạng thái</label>
            <select className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" value={edit.status} onChange={(e) => setEdit((f) => ({ ...f, status: e.target.value as PaymentStatus }))}>
              <option value="PENDING">PENDING</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
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
        <div className="text-sm text-gray-700">Bạn có chắc muốn xóa giao dịch này?        </div>
      </Modal>
      </div>
    </>
  );
}



