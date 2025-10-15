"use client";

import { useMemo, useState } from "react";
import type { HistoryItem } from "@/lib/types";

export function HistoryFilters({ items }: { items: HistoryItem[] }) {
	const [query, setQuery] = useState("");
	const [type, setType] = useState<"all" | HistoryItem["type"]>("all");
	const [page, setPage] = useState(1);
	const pageSize = 10;

	const filtered = useMemo(() => {
		const f = items.filter((x) => {
			const q = query ? (x.customerName + (x.note || "")).toLowerCase().includes(query.toLowerCase()) : true;
			const t = type === "all" ? true : x.type === type;
			return q && t;
		});
		return f;
	}, [items, query, type]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

	return (
		<div className="space-y-3">
			<div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
				<input
					className="border rounded px-3 py-2 flex-1"
					placeholder="Tìm theo tên/ghi chú"
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setPage(1);
					}}
				/>
				<select
					className="border rounded px-3 py-2"
					value={type}
					onChange={(e) => {
						setType(e.target.value as any);
						setPage(1);
					}}
				>
					<option value="all">Tất cả</option>
					<option value="check_in">Check-in</option>
					<option value="check_out">Check-out</option>
					<option value="service">Dịch vụ</option>
				</select>
			</div>
			<div className="rounded-lg border p-3 text-sm text-gray-600">{filtered.length} kết quả</div>
			<div className="overflow-auto rounded-lg border">
				<table className="min-w-full text-sm">
					<thead className="bg-gray-50 text-left">
						<tr>
							<th className="px-4 py-2 font-medium text-gray-600">Khách hàng</th>
							<th className="px-4 py-2 font-medium text-gray-600">Loại</th>
							<th className="px-4 py-2 font-medium text-gray-600">Thời gian</th>
							<th className="px-4 py-2 font-medium text-gray-600">Ghi chú</th>
						</tr>
					</thead>
					<tbody>
						{pageItems.map((h) => (
							<tr key={h.id} className="border-t">
								<td className="px-4 py-2 font-medium">{h.customerName}</td>
								<td className="px-4 py-2">{h.type}</td>
								<td className="px-4 py-2">{new Date(h.timestamp).toLocaleString()}</td>
								<td className="px-4 py-2">{h.note || "-"}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="flex items-center justify-between text-sm">
				<button disabled={page <= 1} className="underline disabled:opacity-50" onClick={() => setPage((p) => Math.max(1, p - 1))}>
					Trước
				</button>
				<div>
					Trang {page}/{totalPages}
				</div>
				<button disabled={page >= totalPages} className="underline disabled:opacity-50" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
					Sau
				</button>
			</div>
		</div>
	);
}


