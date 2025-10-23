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
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-gray-900 truncate">Dịch vụ</h1>
              <p className="text-xs text-gray-500">{filtered.length} dịch vụ</p>
            </div>
          </div>
          <Button 
            onClick={openCreate} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm flex-shrink-0"
          >
            <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="hidden sm:inline">Thêm dịch vụ</span>
            <span className="sm:hidden">Thêm</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="space-y-3">
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
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            {/* Mobile layout */}
            <div className="lg:hidden space-y-3">
              {/* Hàng 1: Tìm kiếm */}
              <div className="flex flex-row items-center">
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <Input
                      placeholder="Tìm kiếm..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 text-sm border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hàng 2: Sắp xếp và Thứ tự */}
              <div className="flex flex-row gap-2 items-center">
                {/* Sắp xếp */}
                <div className="flex-1">
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as 'code' | 'name' | 'price')}
                    className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="code">Code</option>
                    <option value="name">Tên</option>
                    <option value="price">Giá</option>
                  </select>
                </div>

                {/* Thứ tự */}
                <div className="w-32 flex-shrink-0">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                    className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="asc">Tăng dần</option>
                    <option value="desc">Giảm dần</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Desktop layout */}
            <div className="hidden lg:flex flex-row gap-2 items-center">
              {/* Tìm kiếm */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Input
                    placeholder="Tìm kiếm dịch vụ..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-4 pr-10 py-2 text-sm border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Sắp xếp */}
              <div className="w-36 flex-shrink-0">
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as 'code' | 'name' | 'price')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="code">Theo Code</option>
                  <option value="name">Theo Tên</option>
                  <option value="price">Theo Giá</option>
                </select>
              </div>
              
              {/* Thứ tự */}
              <div className="w-28 flex-shrink-0">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="asc">Tăng dần</option>
                  <option value="desc">Giảm dần</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="px-4 py-3">
            <div className="max-w-7xl mx-auto">
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gray-50 border-b border-gray-200 px-6 py-3">
  <div className="flex items-center justify-between">
    {/* Bên trái */}
    <h2 className="text-lg font-bold text-gray-900">Danh sách dịch vụ</h2>

    {/* Bên phải */}
    <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
      {filtered.length} dịch vụ
    </span>
  </div>
</CardHeader>

            <CardBody className="p-0">
                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <colgroup>
                        <col className="w-[15%]" />
                        <col className="w-[25%]" />
                        <col className="w-[15%]" />
                        <col className="w-[12%]" />
                        <col className="w-[15%]" />
                        <col className="w-[18%]" />
                      </colgroup>
                      <thead>
                        <tr className="bg-gray-50 text-gray-700">
                          <th className="px-4 py-3 text-center font-semibold">Code</th>
                          <th className="px-4 py-3 text-center font-semibold">Tên dịch vụ</th>
                          <th className="px-4 py-3 text-center font-semibold">Giá</th>
                          <th className="px-4 py-3 text-center font-semibold">Đơn vị</th>
                          <th className="px-4 py-3 text-center font-semibold">Trạng thái</th>
                          <th className="px-4 py-3 text-center font-semibold">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.slice((page - 1) * size, page * size).map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50 border-b border-gray-100">
                            <td className="px-4 py-3 text-center font-medium text-gray-900">{row.code}</td>
                            <td className="px-4 py-3 text-center text-gray-700">{row.name}</td>
                            <td className="px-4 py-3 text-center text-gray-700">{row.unitPrice.toLocaleString('vi-VN')} VND</td>
                            <td className="px-4 py-3 text-center text-gray-700">{row.unitName}</td>
                            <td className="px-4 py-3 text-center">{renderActiveChip(row.isActive)}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex gap-2 justify-center">
                                <Button
                                  variant="secondary"
                                  className="h-8 px-3 text-xs"
                                  onClick={() => {
                                    setSelected(row)
                                    setDetailOpen(true)
                                  }}
                                >
                                  Xem
                                </Button>
                                <Button
                                  className="h-8 px-3 text-xs"
                                  onClick={() => openEdit(row)}
                                >
                                  Sửa
                                </Button>
                                <Button
                                  variant="danger"
                                  className="h-8 px-3 text-xs"
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

                  {/* Mobile Cards */}
<div className="lg:hidden p-4">
  <div className="grid grid-cols-1 gap-4">
    {filtered.slice((page - 1) * size, page * size).map((row) => (
      <div
        key={row.id}
        className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4"
      >
        <div className="grid grid-cols-[auto_1fr] gap-4 mb-4 items-center">
          {/* Icon chữ cái đầu */}
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">
                {row.code.charAt(0)}
              </span>
            </div>
          </div>

          {/* Thông tin */}
          <div className="flex flex-col gap-2 justify-left">
            <h3 className="font-bold text-gray-900 text-base text-center">{row.code}</h3>
            {/* Giá tiền */}
            <div className="flex items-center gap-2 justify-center">
              <svg
                className="w-4 h-4 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
              <span className="text-sm font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full text-center">
                {row.unitPrice.toLocaleString("vi-VN")} VND
              </span>
            </div>

            {/* Đơn vị */}
            <div className="flex items-center gap-2 justify-center">
              <svg
                className="w-4 h-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <span className="text-sm font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full text-center">
                {row.unitName}
              </span>
            </div>

            {/* Trạng thái */}
                <div className="flex items-center gap-2 justify-center">
              {renderActiveChip(row.isActive)}
            </div>
          </div>
        </div>

        {/* Nút thao tác */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
          <Button
            variant="secondary"
            className="h-9 text-xs font-medium"
            onClick={() => {
              setSelected(row);
              setDetailOpen(true);
            }}
          >
            <svg
              className="w-3 h-3 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Xem
          </Button>

          <Button
            className="h-9 text-xs font-medium"
            onClick={() => openEdit(row)}
          >
            <svg
              className="w-3 h-3 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Sửa
          </Button>

          <Button
            variant="danger"
            className="h-9 text-xs font-medium"
            onClick={() => confirmDelete(row.id)}
          >
            <svg
              className="w-3 h-3 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Xóa
          </Button>
        </div>
      </div>
    ))}
  </div>
</div>

            </CardBody>

                {/* Pagination */}
                {filtered.length > size && (
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 sm:px-6 py-4 sm:py-6 border-t border-gray-200/50">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                      <div className="text-center sm:text-left">
                        <div className="text-xs sm:text-sm text-gray-600 mb-1">Hiển thị kết quả</div>
                        <div className="text-sm sm:text-lg font-bold text-gray-900">
                          <span className="text-blue-600">{(page - 1) * size + 1}</span> - <span className="text-blue-600">{Math.min(page * size, filtered.length)}</span> / <span className="text-gray-600">{filtered.length}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4">
                        <Button
                          variant="secondary"
                          disabled={page === 1}
                          onClick={() => setPage(page - 1)}
                          className="h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          <span className="hidden sm:inline">Trước</span>
                        </Button>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-xs sm:text-sm font-bold text-gray-700 bg-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl border-2 border-blue-200 shadow-sm">
                            {page}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">/ {Math.ceil(filtered.length / size)}</span>
                        </div>
                        <Button
                          variant="secondary"
                          disabled={page >= Math.ceil(filtered.length / size)}
                          onClick={() => setPage(page + 1)}
                          className="h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="hidden sm:inline">Sau</span>
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
          </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết dịch vụ">
        <div className="p-4 sm:p-6">
          {selected && (
            <div className="space-y-6">
              {/* Header với thông tin chính */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                {/* Thông tin dịch vụ chính */}
              <div className="space-y-4">
                  {/* Header với icon */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{selected.code}</h2>
                        <p className="text-base sm:text-lg lg:text-xl text-gray-600 truncate">{selected.name}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-full sm:w-auto">
                      {renderActiveChip(selected.isActive)}
                    </div>
                  </div>

                  {/* Thông tin nhanh */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="text-xs sm:text-sm font-semibold text-blue-700 uppercase">ID</span>
                </div>
                      <p className="text-lg sm:text-xl font-bold text-blue-900">{selected.id}</p>
                </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="text-xs sm:text-sm font-semibold text-blue-700 uppercase">Đơn vị</span>
                </div>
                      <p className="text-lg sm:text-xl font-bold text-blue-900">{selected.unitName}</p>
                </div>
              </div>

                  {/* Giá dịch vụ */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className="text-xs sm:text-sm font-semibold text-blue-700 uppercase">Giá dịch vụ</span>
                </div>
                    <p className="text-base sm:text-lg font-bold text-blue-900">
                      {selected.unitPrice.toLocaleString('vi-VN')} VND
                    </p>
                </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={edit.id ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'}>
        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Form */}
            <div className="space-y-3">
              {/* Code và Tên dịch vụ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              {/* Giá và Đơn vị */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá dịch vụ *</label>
                  <Input
                    type="number"
                    min="0"
                    value={edit.unitPrice}
                    onChange={(e) => {
                      const newPrice = Number(e.target.value)
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

              {/* Trạng thái */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái *</label>
                <select
                  value={edit.isActive ? 'true' : 'false'}
                  onChange={(e) => setEdit({ ...edit, isActive: e.target.value === 'true' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">ACTIVE</option>
                  <option value="false">INACTIVE</option>
                </select>
              </div>

              {/* Mô tả - chỉ hiển thị trên desktop */}
              <div className="hidden sm:block">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={edit.description}
                  onChange={(e) => setEdit({ ...edit, description: e.target.value })}
                  placeholder="Nhập mô tả dịch vụ"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-200">
              <Button 
                variant="secondary" 
                onClick={() => setEditOpen(false)}
                className="w-full sm:w-auto"
              >
                Hủy
              </Button>
              <Button 
                onClick={save}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                {edit.id ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
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
