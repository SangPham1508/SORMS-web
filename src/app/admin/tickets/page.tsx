"use client";

import { useEffect, useMemo, useState } from "react";
import { listTickets, updateTicket } from "@/lib/services/tickets";
import { addAdminHistory } from "@/lib/services/history";

export default function TicketsPage() {
	const [tickets, setTickets] = useState<Array<{ id: string; title: string; status: string; assignee?: string }>>([]);
	const [status, setStatus] = useState<"all" | "open" | "in_progress" | "done">("all");
	const [query, setQuery] = useState("");

	useEffect(() => {
		listTickets().then(setTickets);
	}, []);

	const filtered = useMemo(() => {
		return tickets.filter((t) => {
			const s = status === "all" ? true : t.status === status;
			const q = query ? t.title.toLowerCase().includes(query.toLowerCase()) : true;
			return s && q;
		});
	}, [tickets, status, query]);

    async function assign(id: string) {
		const name = prompt("Giao cho (user/email)") || "";
		const updated = await updateTicket(id, { assignee: name, status: "in_progress" });
        if (updated) { setTickets((prev) => prev.map((x) => (x.id === id ? updated : x))); await addAdminHistory(`Giao ticket ${updated.title} cho ${updated.assignee}`); }
	}

    async function markDone(id: string) {
		const updated = await updateTicket(id, { status: "done" });
        if (updated) { setTickets((prev) => prev.map((x) => (x.id === id ? updated : x))); await addAdminHistory(`Hoàn tất ticket ${updated.title}`); }
	}

    async function deny(id: string) {
		const updated = await updateTicket(id, { status: "open", assignee: undefined });
        if (updated) { setTickets((prev) => prev.map((x) => (x.id === id ? updated : x))); await addAdminHistory(`Từ chối/Reset ticket ${updated.title}`); }
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Ticket Center</h1>
			<div className="flex gap-3 items-stretch md:items-center flex-col md:flex-row">
				<input className="border rounded px-3 py-2" placeholder="Tìm theo tiêu đề" value={query} onChange={(e) => setQuery(e.target.value)} />
				<select className="border rounded px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value as any)}>
					<option value="all">Tất cả</option>
					<option value="open">Open</option>
					<option value="in_progress">In progress</option>
					<option value="done">Done</option>
				</select>
			</div>
			<div className="overflow-auto rounded-lg border">
				<table className="min-w-full text-sm">
					<thead className="bg-gray-50 text-left">
						<tr>
							<th className="px-4 py-2">Tiêu đề</th>
							<th className="px-4 py-2">Trạng thái</th>
							<th className="px-4 py-2">Phụ trách</th>
							<th className="px-4 py-2">Hành động</th>
						</tr>
					</thead>
					<tbody>
						{filtered.map((t) => (
							<tr key={t.id} className="border-t">
								<td className="px-4 py-2 font-medium">{t.title}</td>
								<td className="px-4 py-2">{t.status}</td>
								<td className="px-4 py-2">{t.assignee || "-"}</td>
								<td className="px-4 py-2 space-x-2">
									<button className="link-accent underline" onClick={() => assign(t.id)}>Giao việc</button>
									<button className="underline" onClick={() => markDone(t.id)}>Hoàn tất</button>
									<button className="underline btn-danger" onClick={() => deny(t.id)}>Từ chối</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}


