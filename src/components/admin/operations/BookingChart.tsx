import type { Booking } from "@/lib/types";

export function BookingChart({ bookings }: { bookings: Booking[] }) {
	return (
		<div className="rounded-lg border p-4">
			<div className="text-sm text-gray-500 mb-2">Booking Chart (mock)</div>
			<div className="space-y-2">
				{bookings.map((b) => (
					<div key={b.id} className="flex items-center justify-between text-sm">
						<div className="font-medium">Phòng {b.roomName}</div>
						<div className="text-gray-500">
							{new Date(b.start).toLocaleDateString()} → {new Date(b.end).toLocaleDateString()}
						</div>
						<div className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
							{b.status}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}


