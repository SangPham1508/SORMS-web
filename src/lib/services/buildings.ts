import type { Building } from "@/lib/types";

let data: Building[] = [
	{ id: "A", name: "Nhà A" },
	{ id: "B", name: "Nhà B" },
	{ id: "C", name: "Nhà C" },
];

export async function listBuildings(): Promise<Building[]> {
	return data;
}

export async function createBuilding(input: Omit<Building, "id"> & { id?: string }): Promise<Building> {
	const b: Building = { id: input.id || Math.random().toString(36).slice(2, 7).toUpperCase(), name: input.name, note: input.note };
	data = [b, ...data];
	return b;
}

export async function updateBuilding(id: string, input: Partial<Omit<Building, "id">>): Promise<Building> {
	data = data.map((b) => (b.id === id ? { ...b, ...input } : b));
	return data.find((b) => b.id === id)!;
}

export async function deleteBuilding(id: string): Promise<{ id: string }> {
	data = data.filter((b) => b.id !== id);
	return { id };
}


