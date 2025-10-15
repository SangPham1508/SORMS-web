import type { Room } from "@/lib/types";

export function RoomGrid({ rooms }: { rooms: Room[] }) {
	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
			{rooms.map((room) => (
				<div key={room.id} className="border rounded-md p-3">
					<div className="flex items-center justify-between mb-1">
						<div className="font-medium">{room.name}</div>
						<span
							className={`text-[11px] px-2 py-0.5 rounded-full ${
								room.status === "available"
									? "badge-done"
								: room.status === "occupied"
									? "badge-processing"
								: room.status === "cleaning"
									? "badge-processing"
								: "badge-cancelled"
							}`}
						>
                            {room.status === "available"
                                ? "Trống"
                                : room.status === "occupied"
                                ? "Đang ở"
                                : room.status === "cleaning"
                                ? "Đang dọn"
                                : "Bảo trì"}
						</span>
					</div>
					<div className="text-xs text-gray-500">
                        Tòa: {room.building} · Sức chứa: {room.capacity}
					</div>
				</div>
			))}
		</div>
	);
}


