import { ENDPOINTS } from "@/lib/config";
import { http } from "@/lib/http";
import type { ServiceItem } from "@/lib/types";

export async function listServiceItems(): Promise<ServiceItem[]> {
	// return await http<ServiceItem[]>(ENDPOINTS.services.list());
	return [
		{ id: "s1", name: "Giặt ủi", unit: "kg", price: 20000 },
		{ id: "s2", name: "Bữa sáng", unit: "suất", price: 50000 },
		{ id: "s3", name: "Đưa đón", unit: "lượt", price: 150000 },
	];
}

export async function createServiceItem(input: Omit<ServiceItem, "id">): Promise<ServiceItem> {
	// return await http<ServiceItem>(ENDPOINTS.services.create(), { method: "POST", body: input });
	return { id: Math.random().toString(36).slice(2), ...input };
}

export async function updateServiceItem(id: string, input: Partial<Omit<ServiceItem, "id">>): Promise<ServiceItem> {
	// return await http<ServiceItem>(ENDPOINTS.services.update(id), { method: "PATCH", body: input });
	return { id, name: "", unit: "", price: 0, ...input } as ServiceItem;
}

export async function deleteServiceItem(id: string): Promise<{ id: string }> {
	// await http<void>(ENDPOINTS.services.remove(id), { method: "DELETE" });
	return { id };
}


