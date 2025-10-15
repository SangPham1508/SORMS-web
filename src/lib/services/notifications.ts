export type NotificationTarget = { type: "all" } | { type: "user"; recipient: string };

export type NotificationItem = {
	id: string;
	message: string;
	sender: string; // email/name
	target: NotificationTarget;
	createdAt: string;
};

let store: NotificationItem[] = [];

export async function createNotification(input: Omit<NotificationItem, "id" | "createdAt">): Promise<NotificationItem> {
	const item: NotificationItem = {
		id: Math.random().toString(36).slice(2),
		message: input.message,
		sender: input.sender,
		target: input.target,
		createdAt: new Date().toISOString(),
	};
	store = [item, ...store];
	return item;
}

export async function listReceived(email: string): Promise<NotificationItem[]> {
	return store.filter((n) => n.target.type === "all" || (n.target.type === "user" && n.target.recipient === email));
}

export async function listSent(sender: string): Promise<NotificationItem[]> {
	return store.filter((n) => n.sender === sender);
}


