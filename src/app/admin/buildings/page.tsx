"use client";

import { useEffect, useState } from "react";
import { listBuildings, createBuilding, updateBuilding, deleteBuilding } from "@/lib/services/buildings";
import type { Building } from "@/lib/types";
import { Modal } from "@/components/common/Modal";

export default function BuildingsPage() {
	const [items, setItems] = useState<Building[]>([]);
	const [editing, setEditing] = useState<string | null>(null);
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [note, setNote] = useState("");

	useEffect(() => {
		listBuildings().then(setItems);
	}, []);

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		if (editing) {
			const updated = await updateBuilding(editing, { name, note });
			setItems((prev) => prev.map((b) => (b.id === editing ? updated : b)));
			setEditing(null);
		} else {
			const created = await createBuilding({ name, note });
			setItems((prev) => [created, ...prev]);
		}
		setName("");
		setNote("");
		setOpen(false);
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Quản lý Nhà</h1>
			<div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
				<button className="btn-primary rounded px-4 py-2" onClick={() => { setEditing(null); setName(""); setNote(""); setOpen(true); }}>Thêm nhà</button>
			</div>
			<div className="overflow-auto rounded-lg border border-[var(--border)]">
				<table className="min-w-full text-sm table">
					<thead className="bg-[var(--card)] text-left">
						<tr>
							<th className="px-4 py-2">Mã</th>
							<th className="px-4 py-2">Tên</th>
							<th className="px-4 py-2">Ghi chú</th>
							<th className="px-4 py-2">Hành động</th>
						</tr>
					</thead>
					<tbody>
						{items.map((b) => (
							<tr key={b.id} className="border-t">
								<td className="px-4 py-2 font-mono">{b.id}</td>
								<td className="px-4 py-2 font-medium">{b.name}</td>
								<td className="px-4 py-2">{b.note || "-"}</td>
								<td className="px-4 py-2 space-x-2">
									<button className="link-accent underline" onClick={() => { setEditing(b.id); setName(b.name); setNote(b.note || ""); setOpen(true); }}>Sửa</button>
									<button className="underline btn-danger" onClick={async () => { await deleteBuilding(b.id); setItems((prev) => prev.filter((x) => x.id !== b.id)); }}>Xóa</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<Modal open={open} title={editing ? "Cập nhật nhà" : "Thêm nhà"} onClose={() => setOpen(false)}>
				<form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<input className="border rounded px-3 py-2" placeholder="Tên nhà (VD: Nhà A)" value={name} onChange={(e) => setName(e.target.value)} />
					<input className="border rounded px-3 py-2 md:col-span-2" placeholder="Ghi chú" value={note} onChange={(e) => setNote(e.target.value)} />
					<div className="flex justify-end gap-2 md:col-span-2">
						<button type="button" className="px-4 py-2 rounded border" onClick={() => setOpen(false)}>Hủy</button>
						<button className="btn-primary rounded px-4 py-2">{editing ? "Lưu" : "Thêm"}</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}


