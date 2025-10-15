import { ENDPOINTS } from "@/lib/config";
import { http } from "@/lib/http";

export type Ticket = {
	id: string;
	title: string;
	description?: string;
	status: "open" | "in_progress" | "done";
	assignee?: string;
};

export async function listTickets(): Promise<Ticket[]> {
	// return await http<Ticket[]>(ENDPOINTS.tickets.list());
	return [
		{ id: "t1", title: "Báo hỏng điều hòa phòng 102", status: "open" },
		{ id: "t2", title: "Phản hồi vệ sinh tầng 3", status: "in_progress", assignee: "staff" },
	];
}

// Mock create/update helpers
let _tickets: Ticket[] | null = null;

async function ensureCache() {
    if (_tickets === null) {
        _tickets = await listTickets();
    }
}

export async function createTicket(input: Omit<Ticket, "id" | "status"> & { status?: Ticket["status"] }): Promise<Ticket> {
    await ensureCache();
    const t: Ticket = { id: Math.random().toString(36).slice(2), status: input.status || "open", title: input.title, description: input.description, assignee: input.assignee };
    _tickets = [t, ...(_tickets as Ticket[])];
    return t;
}

export async function updateTicket(id: string, input: Partial<Omit<Ticket, "id">>): Promise<Ticket | null> {
    await ensureCache();
    _tickets = (_tickets as Ticket[]).map((x) => (x.id === id ? { ...x, ...input } : x));
    return (_tickets as Ticket[]).find((x) => x.id === id) || null;
}


