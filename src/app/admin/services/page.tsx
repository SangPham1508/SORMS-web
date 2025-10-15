"use client";

import { useEffect, useState } from "react";
import { listServiceItems, createServiceItem, updateServiceItem, deleteServiceItem } from "@/lib/services/services";
import type { ServiceItem } from "@/lib/types";
import { Modal } from "@/components/common/Modal";
import { addAdminHistory } from "@/lib/services/history";

export default function ServicesPage() {
	const [items, setItems] = useState<ServiceItem[]>([]);
const [form, setForm] = useState<Omit<ServiceItem, "id">>({ name: "", unit: "", price: 0, description: "" });
const [editingId, setEditingId] = useState<string | null>(null);
const [open, setOpen] = useState(false);

	useEffect(() => {
		listServiceItems().then(setItems);
	}, []);

async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (editingId) {
			const updated = await updateServiceItem(editingId, form);
			setItems((prev) => prev.map((i) => (i.id === editingId ? updated : i)));
			setEditingId(null);
            await addAdminHistory(`Cập nhật dịch vụ ${updated.name}`);
		} else {
			const created = await createServiceItem(form);
			setItems((prev) => [created, ...prev]);
            await addAdminHistory(`Tạo dịch vụ ${created.name}`);
		}
    setForm({ name: "", unit: "", price: 0, description: "" });
    setOpen(false);
	}

	return (
		<div className="space-y-6">
    <h1 className="text-2xl font-semibold">Quản lý Dịch vụ</h1>
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
        <button className="btn-primary rounded px-4 py-2" onClick={() => { setEditingId(null); setForm({ name: "", unit: "", price: 0, description: "" }); setOpen(true); }}>Thêm dịch vụ</button>
    </div>
			<div className="overflow-auto rounded-lg border">
				<table className="min-w-full text-sm">
					<thead className="bg-gray-50 text-left">
						<tr>
							<th className="px-4 py-2">Tên</th>
							<th className="px-4 py-2">Đơn vị</th>
							<th className="px-4 py-2">Giá</th>
							<th className="px-4 py-2">Mô tả</th>
							<th className="px-4 py-2">Hành động</th>
						</tr>
					</thead>
					<tbody>
						{items.map((i) => (
							<tr key={i.id} className="border-t">
								<td className="px-4 py-2 font-medium">{i.name}</td>
								<td className="px-4 py-2">{i.unit}</td>
                                <td className="px-4 py-2">{i.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
								<td className="px-4 py-2">{i.description || "-"}</td>
                                <td className="px-4 py-2 space-x-2">
                                    <button className="link-accent underline" onClick={() => { setEditingId(i.id); setForm({ name: i.name, unit: i.unit, price: i.price, description: i.description }); setOpen(true); }}>Sửa</button>
                                    <button className="underline text-red-600" onClick={async () => { await deleteServiceItem(i.id); setItems((prev) => prev.filter((x) => x.id !== i.id)); await addAdminHistory(`Xóa dịch vụ ${i.name}`); }}>Xóa</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
        </div>

        <Modal open={open} title={editingId ? "Cập nhật dịch vụ" : "Thêm dịch vụ"} onClose={() => setOpen(false)}>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className="border rounded px-3 py-2" placeholder="Tên dịch vụ" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="border rounded px-3 py-2" placeholder="Đơn vị" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                <input type="number" className="border rounded px-3 py-2" placeholder="Giá" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Mô tả" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <div className="flex justify-end gap-2 md:col-span-2">
                    <button type="button" className="px-4 py-2 rounded border" onClick={() => setOpen(false)}>Hủy</button>
                    <button className="btn-primary rounded px-4 py-2">{editingId ? "Lưu" : "Thêm"}</button>
                </div>
            </form>
        </Modal>
		</div>
	);
}


