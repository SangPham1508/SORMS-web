import { ENDPOINTS } from "@/lib/config";
import { http } from "@/lib/http";
import type { HistoryItem } from "@/lib/types";

let store: HistoryItem[] | null = null;

export async function listHistories(): Promise<HistoryItem[]> {
    // return await http<HistoryItem[]>(ENDPOINTS.history.list());
    if (store) return store;
    const now = new Date();
    store = [
        { id: "h1", customerId: "c1", customerName: "Nguyen Van A", type: "check_in", timestamp: new Date(now.getTime() - 3600_000).toISOString(), note: "Phòng 101" },
        { id: "h2", customerId: "c2", customerName: "Tran Thi B", type: "service", timestamp: new Date(now.getTime() - 2 * 3600_000).toISOString(), note: "Spa" },
        { id: "h3", customerId: "c1", customerName: "Nguyen Van A", type: "check_out", timestamp: new Date(now.getTime() - 24 * 3600_000).toISOString(), note: "Phòng 101" },
    ];
    return store;
}

function uid() { return Math.random().toString(36).slice(2); }

export async function addAdminHistory(message: string): Promise<HistoryItem> {
    const list = await listHistories();
    const item: HistoryItem = {
        id: uid(),
        customerId: "admin",
        customerName: "Admin",
        type: "service",
        timestamp: new Date().toISOString(),
        note: message,
    };
    store = [item, ...list];
    return item;
}


