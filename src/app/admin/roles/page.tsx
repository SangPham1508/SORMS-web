"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Table, THead, TBody } from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";

type Role = { id: number; code: string; name: string; description?: string; isVisible: boolean };

const mock: Role[] = [
  { id: 1, code: "admin", name: "Admin", description: "System Administrator", isVisible: true },
  { id: 2, code: "office", name: "Office", description: "Office Staff", isVisible: true },
  { id: 3, code: "lecture", name: "Lecture", description: "Lecturer", isVisible: false },
  { id: 4, code: "staff", name: "Staff", description: "Employee", isVisible: true },
  { id: 5, code: "guest", name: "Guest", description: "Visitor", isVisible: false },
];

export default function RolesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<Role[]>(mock);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [productToDelete, setProductToDelete] = useState<Role | null>(null);
  const [form, setForm] = useState<Pick<Role, "code" | "name" | "description" | "isVisible">>({
    code: "",
    name: "",
    description: "",
    isVisible: true,
  });
  const [flash, setFlash] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Role | null>(null);
  const [sortKey, setSortKey] = useState<"id" | "code" | "name">("code");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  // Remove role from list
  function remove(id: number) {
    setRows((r) => r.filter((x) => x.id !== id));
    setFlash({ type: 'success', text: 'Đã xóa vai trò thành công.' });
  }

  // Filter and sort roles based on query and sort
  const filtered = rows
    .filter((r) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        r.code.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1;
      if (sortKey === "id") return (a.id - b.id) * dir;
      if (sortKey === "code") return a.code.localeCompare(b.code) * dir;
      return a.name.localeCompare(b.name) * dir;
    });

  // Open modal to create a new role
  function openCreate() {
    setEditing(null);
    setForm({ code: "", name: "", description: "", isVisible: true });
    setOpen(true);
  }

  // Open modal to edit an existing role
  function openEdit(role: Role) {
    setEditing(role);
    setForm({ code: role.code, name: role.name, description: role.description || "", isVisible: role.isVisible });
    setOpen(true);
  }

  // Save new or updated role
  function save() {
    if (!form.code.trim() || !form.name.trim()) {
      setFlash({ type: 'error', text: 'Vui lòng nhập Code và Tên.' });
      return;
    }
    if (editing) {
      setRows((rs) => rs.map((r) => (r.id === editing.id ? { ...r, ...form } : r)));
    } else {
      const nextId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
      setRows((rs) => [...rs, { id: nextId, ...form }]);
    }
    setFlash({ type: 'success', text: editing ? 'Đã cập nhật vai trò thành công.' : 'Đã tạo vai trò mới thành công.' });
    setOpen(false);
  }

  // Open modal to confirm deletion
  function handleOpenDelete(role: Role) {
    setProductToDelete(role);
    setOpenDeleteModal(true);
  }

  // Confirm deletion and remove the role
  function confirmDelete() {
    if (productToDelete) {
      setRows(rows.filter((r) => r.id !== productToDelete.id));
      setFlash({ type: 'success', text: 'Đã xóa vai trò thành công.' });
    }
    setOpenDeleteModal(false);
  }

  // Auto-hide success/error messages after a few seconds
  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 3000);
    return () => clearTimeout(timer);
  }, [flash]);

  // Initialize state from URL on mount
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const s = (searchParams.get("sort") as any) || "code";
    const o = (searchParams.get("order") as any) || "asc";
    const p = parseInt(searchParams.get("page") || "1", 10);
    const sz = parseInt(searchParams.get("size") || "10", 10);
    setQuery(q);
    if (s === "id" || s === "code" || s === "name") setSortKey(s);
    if (o === "asc" || o === "desc") setSortOrder(o);
    if (!Number.isNaN(p) && p > 0) setPage(p);
    if (!Number.isNaN(sz) && [10,20,50].includes(sz)) setSize(sz as 10|20|50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state to URL (no scroll)
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("sort", sortKey);
    params.set("order", sortOrder);
    params.set("page", String(page));
    params.set("size", String(size));
    const search = params.toString();
    router.replace(`?${search}`, { scroll: false });
  }, [query, sortKey, sortOrder, page, size, router]);

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Quản lý phân quyền</h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">Theo dõi và quản lý các vai trò trong hệ thống</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button className="h-8 sm:h-9 px-3 sm:px-4 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-xs sm:text-sm whitespace-nowrap" onClick={openCreate}>
              Tạo vai trò
            </Button>
            <button
              aria-label="Xuất Excel (CSV)"
              title="Xuất Excel (CSV)"
              className="h-8 sm:h-9 px-2 sm:px-3 rounded-md border border-gray-300 bg-white text-xs sm:text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              onClick={() => {
                const csv = [['ID', 'Code', 'Tên', 'Mô tả', 'Hiển thị'], ...filtered.map(r => [r.id, r.code, r.name, r.description || '', r.isVisible ? 'Có' : 'Không'])]
                const blob = new Blob([csv.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'roles.xlsx'
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
          <Input 
            className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm" 
            placeholder="Tìm theo code, tên..." 
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
          <div className="text-xs sm:text-sm text-gray-600">Tổng: {filtered.length} vai trò</div>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700">ID</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700">Code</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700">Tên</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700">Mô tả</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice((page - 1) * size, (page - 1) * size + size).map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">{r.id}</td>
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
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700">{r.name}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-500 truncate" title={r.description}>{r.description}</td>
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
                          onClick={() => handleOpenDelete(r)}
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

      {/* Modal for Create/Update */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Sửa vai trò" : "Tạo vai trò"}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={save}
            >
              Lưu
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <Input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            />
            {!form.code.trim() && <div className="mt-1 text-xs text-red-600">Code bắt buộc.</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            {!form.name.trim() && <div className="mt-1 text-xs text-red-600">Tên bắt buộc.</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <Input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} title="Xác nhận xóa">
        <div className="text-sm text-gray-700">Bạn có chắc muốn xóa vai trò này?</div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="secondary"
            onClick={() => setOpenDeleteModal(false)}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
          >
            Xóa
          </Button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết vai trò">
        {selected ? (
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">ID:</span> {selected.id}</div>
            <div><span className="font-medium">Code:</span> {selected.code}</div>
            <div><span className="font-medium">Tên:</span> {selected.name}</div>
            <div><span className="font-medium">Mô tả:</span> {selected.description || "—"}</div>
          </div>
        ) : null}
      </Modal>
      </div>
    </>
  );
}
