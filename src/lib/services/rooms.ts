import { ENDPOINTS } from "@/lib/config";
import { http } from "@/lib/http";
import type { Room } from "@/lib/types";

// NOTE: switch to real API by replacing mock with http calls
export async function listRooms(): Promise<Room[]> {
	// return await http<Room[]>(ENDPOINTS.rooms.list());
	const buildings = ["Nhà A", "Nhà B", "Nhà C"];
	const rooms: Room[] = [];
	buildings.forEach((b, bi) => {
		for (let i = 1; i <= 3; i++) {
			const id = `${bi + 1}0${i}`;
            rooms.push({
                id,
                name: `${b}-${i}`,
                capacity: i === 3 ? 4 : i === 2 ? 3 : 2,
                status: ((): Room["status"] => {
					if (i === 1) return "available";
					if (i === 2) return "occupied";
					return "cleaning";
				})(),
				building: b,
			});
		}
	});
	return rooms;
}

export async function createRoom(input: Omit<Room, "id">): Promise<Room> {
	// return await http<Room>(ENDPOINTS.rooms.create(), { method: "POST", body: input });
	return { id: Math.random().toString(36).slice(2), ...input };
}

export async function updateRoom(id: string, input: Partial<Omit<Room, "id">>): Promise<Room> {
    // return await http<Room>(ENDPOINTS.rooms.update(id), { method: "PATCH", body: input });
    return { id, name: "", capacity: 2, status: "available", building: "Nhà A", ...input } as Room;
}

export async function deleteRoom(id: string): Promise<{ id: string }> {
	// await http<void>(ENDPOINTS.rooms.remove(id), { method: "DELETE" });
	return { id };
}


