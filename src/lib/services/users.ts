import { ENDPOINTS } from "@/lib/config";
import { http } from "@/lib/http";
import type { UserAccount } from "@/lib/types";

export async function listUsers(): Promise<UserAccount[]> {
	// return await http<UserAccount[]>(ENDPOINTS.users.list());
	return [
		{ id: "u1", name: "Admin", email: "admin@example.com", role: "admin", active: true },
		{ id: "u2", name: "Phòng HC", email: "office@example.com", role: "admin_office", active: true },
		{ id: "u3", name: "Nhân viên", email: "staff@example.com", role: "staff", active: true },
	];
}

export async function createUser(input: Omit<UserAccount, "id">): Promise<UserAccount> {
    return { id: Math.random().toString(36).slice(2), ...input };
}

export async function getUserByEmail(email: string): Promise<UserAccount | null> {
    const users = await listUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}


