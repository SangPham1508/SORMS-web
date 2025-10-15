export type RoomStatus = "available" | "occupied" | "cleaning" | "maintenance";

export type Room = {
	id: string;
	name: string;
	capacity: number;
	status: RoomStatus;
    building?: string; // e.g., Nha A/B/C
    currentGuest?: string;
};

export type Building = {
    id: string;
    name: string; // e.g., Nhà A
    note?: string;
};

export type BookingStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";

export type Booking = {
	id: string;
	roomId: string;
	roomName: string;
	customerName: string;
	start: string; // ISO date
	end: string; // ISO date
	status: BookingStatus;
};

export type HistoryItem = {
	id: string;
	customerId: string;
	customerName: string;
	type: "check_in" | "check_out" | "service";
	timestamp: string; // ISO date
	note?: string;
};

export type ServiceItem = {
	id: string;
	name: string;
	description?: string;
	price: number; // per unit
	unit: string; // e.g., time/use/room
};

export type Invoice = {
	id: string;
	customerName: string;
	createdAt: string;
	status: "unpaid" | "paid" | "void";
	items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
	subtotal: number;
	tax: number;
	total: number;
    paymentMethod?: "cash" | "transfer";
    paidAt?: string;
    referenceCode?: string;
};

export type UserAccount = {
	id: string;
	name: string;
	email: string;
	role: string;
	active: boolean;
};

export type RevenuePoint = { date: string; revenue: number };
export type PerformanceReport = { occupancyRate: number; revpar: number; topServices: Array<{ name: string; count: number }> };


