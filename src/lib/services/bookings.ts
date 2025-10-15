import { ENDPOINTS } from "@/lib/config";
import { http } from "@/lib/http";
import type { Booking } from "@/lib/types";

export async function listBookings(): Promise<Booking[]> {
	// return await http<Booking[]>(ENDPOINTS.bookings.list());
	const now = new Date();
	const d = (n: number) => new Date(now.getTime() + n * 24 * 3600 * 1000).toISOString();
	return [
		{ id: "b1", roomId: "101", roomName: "101", customerName: "Nguyen Van A", start: d(0), end: d(2), status: "confirmed" },
		{ id: "b2", roomId: "102", roomName: "102", customerName: "Tran Thi B", start: d(1), end: d(3), status: "pending" },
		{ id: "b3", roomId: "103", roomName: "103", customerName: "Le C", start: d(-2), end: d(-1), status: "checked_out" },
	];
}


