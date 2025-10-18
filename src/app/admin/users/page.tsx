"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

type User = {
  id: number;
  email: string;
  full_name: string;
  phone_number?: string;
  status: "ACTIVE" | "INACTIVE";
  roles: string[];
};

const mock: User[] = [
  { id: 1, email: "admin@fpt.edu.vn", full_name: "System Admin", status: "ACTIVE", roles: ["admin"] },
  { id: 2, email: "office01@fe.edu.vn", full_name: "Office User", status: "INACTIVE", roles: ["office"] },
  { id: 3, email: "guest@example.com", full_name: "Khách", status: "ACTIVE", roles: ["guest"] },
];

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<User[]>(mock);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"id" | "name" | "email">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const roleOptions = ["admin", "office", "lecture", "staff", "guest"] as const;
  const [editForm, setEditForm] = useState<{ id?: number; full_name: string; email: string; phone_number?: string; role: string }>(
    { full_name: "", email: "", phone_number: "", role: "" }
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<{ full_name: string; email: string; phone_number?: string; role: string }>(
    { full_name: "", email: "", phone_number: "", role: "" }
  );
  const [confirmOpen, setConfirmOpen] = useState<{ open: boolean; type: 'deactivate' | 'activate'; user?: User }>({ open: false, type: 'deactivate' });
  const [message, setMessage] = useState<string | null>(null);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const s = (searchParams.get("sort") as any) || "id";
    const o = (searchParams.get("order") as any) || "asc";
    const p = parseInt(searchParams.get("page") || "1", 10);
    const sz = parseInt(searchParams.get("size") || "10", 10);
    setQuery(q);
    if (s === "id" || s === "name" || s === "email") setSortKey(s);
    if (o === "asc" || o === "desc") setSortOrder(o);
    if (!Number.isNaN(p) && p > 0) setPage(p);
    if (!Number.isNaN(sz) && [10,20,50].includes(sz)) setSize(sz as 10|20|50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("sort", sortKey);
    params.set("order", sortOrder);
    params.set("page", String(page));
    params.set("size", String(size));
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [query, sortKey, sortOrder, page, size, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? rows.filter(
          (u) =>
            u.email.toLowerCase().includes(q) ||
            u.full_name.toLowerCase().includes(q) ||
            u.roles.join(",").includes(q)
        )
      : rows;
    const ordered = [...list].sort((a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1;
      if (sortKey === "id") return (a.id - b.id) * dir;
      if (sortKey === "name") return a.full_name.localeCompare(b.full_name) * dir;
      return a.email.localeCompare(b.email) * dir;
    });
    return ordered;
  }, [rows, query, sortKey, sortOrder]);

  function deactivate(id: number) {
    setRows((r) => r.map((u) => (u.id === id ? { ...u, status: "INACTIVE" } : u)));
  }

  function activate(id: number) {
    setRows((r) => r.map((u) => (u.id === id ? { ...u, status: "ACTIVE" } : u)));
  }

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Quản lý người dùng</h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">Theo dõi và quản lý tài khoản người dùng</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button className="h-8 sm:h-9 px-3 sm:px-4 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-xs sm:text-sm whitespace-nowrap" onClick={() => { setCreateForm({ full_name: "", email: "", phone_number: "", role: "" }); setCreateOpen(true); }}>
              Tạo người dùng
            </Button>
            <button
              type="button"
              aria-label="Xuất Excel"
              title="Xuất Excel"
              className="h-8 sm:h-9 px-2 sm:px-3 rounded-md border border-gray-300 bg-white text-xs sm:text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              onClick={() => {
                const csv = [['ID', 'Email', 'Họ tên', 'Vai trò', 'Trạng thái'], ...filtered.map(u => [u.id, u.email, u.full_name, u.roles.join(','), u.status])]
                const blob = new Blob([csv.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `users_${new Date().toISOString().slice(0,10)}.xlsx`
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
        {message && (
          <div className="rounded-md border p-2 sm:p-3 text-xs sm:text-sm shadow-sm bg-green-50 border-green-200 text-green-800">
            {message}
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <Input
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
              placeholder="Tìm theo email, họ tên, vai trò..."
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
                <option value="id">ID</option>
                <option value="name">Họ tên</option>
                <option value="email">Email</option>
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
          <div className="text-xs sm:text-sm text-gray-600">Tổng: {filtered.length} người dùng</div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full table-fixed text-xs sm:text-sm">
            <colgroup>
              <col className="w-[5%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[25%]" />
            </colgroup>
            <thead>
              <tr className="bg-gray-200 text-gray-700 text-xs sm:text-sm">
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">ID</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Họ tên</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Email</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Điện thoại</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Vai trò</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Trạng thái</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .slice((page - 1) * size, (page - 1) * size + size)
                .map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">{u.id}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2">
                      <span
                        role="button"
                        tabIndex={0}
                        className="cursor-pointer underline underline-offset-2 text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                        onClick={() => { setSelected(u); setDetailOpen(true); }}
                      >
                        {u.full_name}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 font-mono text-xs sm:text-sm truncate max-w-[180px] sm:max-w-[240px] lg:max-w-[300px]" title={u.email}>
                      <span
                        role="button"
                        tabIndex={0}
                        className="cursor-pointer underline underline-offset-2 text-blue-600 hover:text-blue-700"
                        onClick={() => { setSelected(u); setDetailOpen(true); }}
                      >
                        {u.email}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">{u.phone_number || "—"}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <Badge key={r}>{r}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2">
                      {u.status === "ACTIVE" ? <Badge tone="success">ACTIVE</Badge> : <Badge tone="muted">INACTIVE</Badge>}
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <Button variant="secondary" className="h-6 sm:h-8 px-2 sm:px-3 text-xs" onClick={() => { setSelected(u); setDetailOpen(true); }}>Xem</Button>
                        <Button variant="secondary" className="h-6 sm:h-8 px-2 sm:px-3 text-xs" onClick={() => {
                          setEditForm({ id: u.id, full_name: u.full_name, email: u.email, phone_number: u.phone_number, role: u.roles[0] || "" });
                          setEditOpen(true);
                        }}>Sửa</Button>
                        {u.status === "ACTIVE" ? (
                          <Button variant="danger" className="h-6 sm:h-8 px-2 sm:px-3 text-xs" onClick={() => setConfirmOpen({ open: true, type: 'deactivate', user: u })}>Vô hiệu</Button>
                        ) : (
                          <Button className="h-6 sm:h-8 px-2 sm:px-3 text-xs" onClick={() => setConfirmOpen({ open: true, type: 'activate', user: u })}>Kích hoạt</Button>
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

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Chi tiết người dùng">
        {selected ? (
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">ID:</span> {selected.id}</div>
            <div><span className="font-medium">Họ tên:</span> {selected.full_name}</div>
            <div><span className="font-medium">Email:</span> {selected.email}</div>
            <div><span className="font-medium">Điện thoại:</span> {selected.phone_number || "—"}</div>
            <div><span className="font-medium">Vai trò:</span> {selected.roles.join(', ')}</div>
            <div><span className="font-medium">Trạng thái:</span> {selected.status}</div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Sửa người dùng"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Hủy</Button>
            <Button disabled={!editForm.id || !editForm.full_name.trim() || !emailRegex.test(editForm.email) || !editForm.role}
              onClick={() => {
              setRows((rs) => rs.map((u) => u.id === editForm.id
                ? { ...u, full_name: editForm.full_name, email: editForm.email, phone_number: editForm.phone_number, roles: editForm.role ? [editForm.role] : [] }
                : u
              ));
              setEditOpen(false);
              setMessage('Đã cập nhật người dùng.');
            }}>Lưu</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Họ tên</label>
            <Input value={editForm.full_name} onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Điện thoại</label>
            <Input value={editForm.phone_number || ''} onChange={(e) => setEditForm((f) => ({ ...f, phone_number: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Vai trò</label>
            <select
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editForm.role}
              onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
            >
              <option value="">-- Chọn vai trò --</option>
              {roleOptions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <div className="mt-1 text-xs text-red-600">
              {!editForm.full_name.trim() ? 'Họ tên bắt buộc. ' : ''}
              {!emailRegex.test(editForm.email) ? 'Email không hợp lệ. ' : ''}
              {!editForm.role ? 'Vui lòng chọn vai trò.' : ''}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal tạo người dùng */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Tạo người dùng"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Hủy</Button>
            <Button disabled={!createForm.full_name.trim() || !emailRegex.test(createForm.email) || !createForm.role}
              onClick={() => {
              const nextId = rows.length ? Math.max(...rows.map(u => u.id)) + 1 : 1;
              setRows((rs) => [
                ...rs,
                { id: nextId, full_name: createForm.full_name, email: createForm.email, phone_number: createForm.phone_number, roles: [createForm.role], status: 'ACTIVE' } as User,
              ]);
              setCreateOpen(false);
              setMessage('Đã tạo người dùng mới.');
            }}>Tạo</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Họ tên</label>
            <Input value={createForm.full_name} onChange={(e) => setCreateForm((f) => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Điện thoại</label>
            <Input value={createForm.phone_number || ''} onChange={(e) => setCreateForm((f) => ({ ...f, phone_number: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Vai trò</label>
            <select
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={createForm.role}
              onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}
            >
              <option value="">-- Chọn vai trò --</option>
              {roleOptions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <div className="mt-1 text-xs text-red-600">
              {!createForm.full_name.trim() ? 'Họ tên bắt buộc. ' : ''}
              {!emailRegex.test(createForm.email) ? 'Email không hợp lệ. ' : ''}
              {!createForm.role ? 'Vui lòng chọn vai trò.' : ''}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal xác nhận kích hoạt/vô hiệu */}
      <Modal
        open={confirmOpen.open}
        onClose={() => setConfirmOpen({ open: false, type: 'deactivate' })}
        title={confirmOpen.type === 'deactivate' ? 'Xác nhận vô hiệu' : 'Xác nhận kích hoạt'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmOpen({ open: false, type: 'deactivate' })}>Hủy</Button>
            <Button onClick={() => {
              if (!confirmOpen.user) return;
              if (confirmOpen.type === 'deactivate') {
                deactivate(confirmOpen.user.id);
                setMessage('Đã vô hiệu người dùng.');
              } else {
                activate(confirmOpen.user.id);
                setMessage('Đã kích hoạt người dùng.');
              }
              setConfirmOpen({ open: false, type: 'deactivate' });
            }}>Xác nhận</Button>
          </div>
        }
      >
        <div className="text-sm text-gray-700">
          {confirmOpen.type === 'deactivate' ? 'Bạn có chắc muốn vô hiệu người dùng này?' : 'Bạn có chắc muốn kích hoạt người dùng này?'}
        </div>
      </Modal>
      </div>
    </>
  );
}


