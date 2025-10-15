"use client";

import { useEffect, useMemo, useState } from "react";
import type { Room, RoomStatus } from "@/lib/types";
import { listRooms, createRoom, updateRoom, deleteRoom } from "@/lib/services/rooms";
import { addAdminHistory } from "@/lib/services/history";
import { Modal } from "@/components/common/Modal";

type RoomFormState = {
    name: string;
    capacity: number;
    status: RoomStatus;
    building: string;
};

const emptyForm: RoomFormState = { name: "", capacity: 2, status: "available", building: "Nhà A" };

export function RoomsManager() {
	const [rooms, setRooms] = useState<Room[]>([]);
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState<RoomFormState>(emptyForm);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [openModal, setOpenModal] = useState<"create" | "edit" | null>(null);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<RoomStatus | "all">("all");
	const [buildingFilter, setBuildingFilter] = useState<string | "all">("all");

	useEffect(() => {
		setLoading(true);
		listRooms().then((data) => setRooms(data)).finally(() => setLoading(false));
	}, []);

	const filteredRooms = useMemo(() => {
		return rooms.filter((r) => {
			const matchQuery = query ? r.name.toLowerCase().includes(query.toLowerCase()) : true;
			const matchStatus = statusFilter === "all" ? true : r.status === statusFilter;
			const matchBuilding = buildingFilter === "all" ? true : (r.building || "") === buildingFilter;
			return matchQuery && matchStatus && matchBuilding;
		});
	}, [rooms, query, statusFilter, buildingFilter]);

	const groupedByBuilding = useMemo(() => {
		const groups = new Map<string, Room[]>();
		for (const r of filteredRooms) {
			const key = r.building || "Khác";
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key)!.push(r);
		}
		return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
	}, [filteredRooms]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		try {
            if (editingId) {
				const updated = await updateRoom(editingId, form);
				setRooms((prev) => prev.map((r) => (r.id === editingId ? { ...r, ...updated } : r)));
                await addAdminHistory(`Cập nhật phòng ${updated.name}`);
			} else {
				const created = await createRoom(form);
				setRooms((prev) => [created, ...prev]);
                await addAdminHistory(`Tạo phòng ${created.name}`);
			}
			setForm(emptyForm);
			setEditingId(null);
			setOpenModal(null);
		} finally {
			setLoading(false);
		}
	}

    function handleEdit(room: Room) {
		setEditingId(room.id);
        setForm({ name: room.name, capacity: room.capacity, status: room.status, building: room.building || "Nhà A" });
		setOpenModal("edit");
	}

	async function handleDelete(id: string) {
		setLoading(true);
		try {
            await deleteRoom(id);
            await addAdminHistory(`Xóa phòng ${id}`);
			setRooms((prev) => prev.filter((r) => r.id !== id));
		} finally {
			setLoading(false);
		}
	}

    async function handleCheckIn(id: string) {
		setLoading(true);
		try {
            const guest = prompt("Tên khách check-in") || undefined;
            const updated = await updateRoom(id, { status: "occupied", currentGuest: guest });
			setRooms((prev) => prev.map((r) => (r.id === id ? updated : r)));
            await addAdminHistory(`Check-in phòng ${updated.name} cho khách ${guest || "N/A"}`);
		} finally {
			setLoading(false);
		}
	}

    async function handleCheckOut(id: string) {
		setLoading(true);
		try {
            const updated = await updateRoom(id, { status: "cleaning", currentGuest: undefined });
			setRooms((prev) => prev.map((r) => (r.id === id ? updated : r)));
            await addAdminHistory(`Check-out phòng ${updated.name}`);
		} finally {
			setLoading(false);
		}
	}

	const TOUR_URL = "https://viewdaihoc.fpt.edu.vn/fpt-quy-nhon/?__cf_chl_rt_tk=tYP984nIJLbaBwmIluN15VpN4Gt2V.RSHdoGto3hacw-1757938407-1.0.1.1-fQ3twzSc8cBvh38hQnPQTw2KDQ1aD0VBYZBuz3dhCFY";

	return (
		<div className="space-y-6">
			<div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
				<button className="btn-primary rounded px-4 py-2" onClick={() => { setForm(emptyForm); setEditingId(null); setOpenModal("create"); }}>Thêm phòng</button>
			</div>

			<div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
				<input className="border rounded px-3 py-2 flex-1" placeholder="Tìm theo tên" value={query} onChange={(e) => setQuery(e.target.value)} />
				<select className="border rounded px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as RoomStatus | "all")}> 
					<option value="all">Tất cả trạng thái</option>
					<option value="available">Trống</option>
					<option value="occupied">Đang ở</option>
					<option value="cleaning">Cần dọn dẹp</option>
					<option value="maintenance">Bảo trì</option>
				</select>
				<select className="border rounded px-3 py-2" value={buildingFilter} onChange={(e) => setBuildingFilter(e.target.value)}>
					<option value="all">Tất cả nhà</option>
					<option>Nhà A</option>
					<option>Nhà B</option>
					<option>Nhà C</option>
				</select>
			</div>

			<div className="space-y-6">
				{groupedByBuilding.map(([building, items]) => (
					<div key={building} className="rounded-lg border border-[var(--border)] overflow-hidden">
						<div className="px-4 py-2 bg-[var(--card)] text-[var(--foreground)] font-semibold flex items-center justify-between">
							<div>{building} <span className="text-[var(--muted)] font-normal">({items.length} phòng)</span></div>
							<a className="btn-primary rounded px-3 py-1 text-sm" href={TOUR_URL} target="_blank" rel="noopener noreferrer">Xem Virtual Tour</a>
						</div>
						<div className="overflow-auto">
							<table className="min-w-full text-sm table">
								<thead className="bg-[var(--card)] text-left">
									<tr>
										<th className="px-4 py-2 font-medium text-gray-600">Phòng</th>
										<th className="px-4 py-2 font-medium text-gray-600">Sức chứa</th>
										<th className="px-4 py-2 font-medium text-gray-600">Trạng thái</th>
										<th className="px-4 py-2 font-medium text-gray-600">Hành động</th>
									</tr>
								</thead>
								<tbody>
									{items.map((r) => (
										<tr key={r.id} className="border-t">
											<td className="px-4 py-2 font-medium">{r.name}</td>
                                        <td className="px-4 py-2">{r.capacity}</td>
                                        <td className="px-4 py-2">
												<span className={`text-[11px] px-2 py-0.5 rounded-full ${r.status === "available" ? "badge-done" : r.status === "occupied" ? "badge-processing" : r.status === "cleaning" ? "badge-processing" : "badge-cancelled"}`}>
													{r.status}
												</span>
                                            {r.currentGuest ? <div className="text-[11px] text-[var(--muted)] mt-1">Khách: {r.currentGuest}</div> : null}
											</td>
								<td className="px-4 py-2 space-x-2">
												<button disabled={loading} className="link-accent underline" onClick={() => handleEdit(r)}>
													Sửa
												</button>
												<button disabled={loading} className="underline btn-danger" onClick={() => handleDelete(r.id)}>
													Xóa
												</button>
									{r.status === "available" ? (
										<button disabled={loading} className="underline" onClick={() => handleCheckIn(r.id)}>Check-in</button>
									) : null}
									{r.status === "occupied" ? (
										<button disabled={loading} className="underline" onClick={() => handleCheckOut(r.id)}>Check-out</button>
									) : null}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				))}
			</div>

			<Modal open={openModal !== null} title={openModal === "edit" ? "Cập nhật phòng" : "Thêm phòng"} onClose={() => setOpenModal(null)}>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input required className="border rounded px-3 py-2" placeholder="Tên phòng" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
					<input type="number" min={1} required className="border rounded px-3 py-2" placeholder="Sức chứa" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
					<select className="border rounded px-3 py-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as RoomStatus })}>
						<option value="available">Trống</option>
						<option value="occupied">Đang ở</option>
						<option value="cleaning">Cần dọn dẹp</option>
						<option value="maintenance">Bảo trì</option>
					</select>
					<select className="border rounded px-3 py-2" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })}>
						<option>Nhà A</option>
						<option>Nhà B</option>
						<option>Nhà C</option>
					</select>
					<div className="flex justify-end gap-2 md:col-span-2">
						<button type="button" className="px-4 py-2 rounded border" onClick={() => setOpenModal(null)}>Hủy</button>
						<button className="btn-primary rounded px-4 py-2" disabled={loading}>{editingId ? "Lưu" : "Thêm"}</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}


