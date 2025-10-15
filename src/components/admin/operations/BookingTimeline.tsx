"use client";

import { useEffect, useMemo, useState } from "react";
import type { Booking } from "@/lib/types";
import { listBookings } from "@/lib/services/bookings";

function toDateOnlyISO(d: Date) {
	const z = new Date(d.getTime());
	z.setHours(0, 0, 0, 0);
	return z.toISOString().slice(0, 10);
}

export function BookingTimeline() {
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [from, setFrom] = useState<string>(toDateOnlyISO(new Date(Date.now() - 2 * 24 * 3600_000)));
	const [to, setTo] = useState<string>(toDateOnlyISO(new Date(Date.now() + 5 * 24 * 3600_000)));

	useEffect(() => {
		listBookings().then(setBookings);
	}, []);

	const filtered = useMemo(() => {
		const fromDate = new Date(from);
		const toDate = new Date(to);
		return bookings.filter((b) => new Date(b.end) >= fromDate && new Date(b.start) <= toDate);
	}, [bookings, from, to]);

	const days: string[] = useMemo(() => {
		const out: string[] = [];
		const start = new Date(from);
		const end = new Date(to);
		for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
			out.push(toDateOnlyISO(d));
		}
		return out;
	}, [from, to]);

	return (
		<div className="space-y-3">
			<div className="flex gap-3 items-center">
				<label className="text-sm text-gray-600">Từ</label>
				<input type="date" className="border rounded px-3 py-2" value={from} onChange={(e) => setFrom(e.target.value)} />
				<label className="text-sm text-gray-600">Đến</label>
				<input type="date" className="border rounded px-3 py-2" value={to} onChange={(e) => setTo(e.target.value)} />
			</div>
			<div className="overflow-auto rounded-lg border">
				<table className="min-w-full text-sm">
					<thead>
						<tr>
							<th className="px-4 py-2 text-left">Phòng</th>
							{days.map((d) => (
								<th key={d} className="px-2 py-2 text-center text-[11px] text-gray-600">
									{d}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{filtered.map((b) => {
							return (
								<tr key={b.id} className="border-t">
									<td className="px-4 py-2 font-medium">{b.roomName}</td>
									{days.map((d) => {
										const inRange = new Date(d) >= new Date(b.start.slice(0, 10)) && new Date(d) <= new Date(b.end.slice(0, 10));
										return (
											<td key={d} className={`h-8 w-8 ${inRange ? "bg-blue-500/70" : "bg-transparent"}`}></td>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}


