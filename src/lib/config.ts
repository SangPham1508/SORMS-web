export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

// Centralized endpoints for easy adjustment
export const ENDPOINTS = {
	rooms: {
		list: () => `${API_BASE_URL}/rooms`,
		create: () => `${API_BASE_URL}/rooms`,
		update: (id: string) => `${API_BASE_URL}/rooms/${id}`,
		remove: (id: string) => `${API_BASE_URL}/rooms/${id}`,
	},
	bookings: {
		list: () => `${API_BASE_URL}/bookings`,
		create: () => `${API_BASE_URL}/bookings`,
		update: (id: string) => `${API_BASE_URL}/bookings/${id}`,
		remove: (id: string) => `${API_BASE_URL}/bookings/${id}`,
	},
	history: {
		list: () => `${API_BASE_URL}/histories`,
	},
	services: {
		list: () => `${API_BASE_URL}/services`,
		create: () => `${API_BASE_URL}/services`,
		update: (id: string) => `${API_BASE_URL}/services/${id}`,
		remove: (id: string) => `${API_BASE_URL}/services/${id}`,
	},
	billing: {
		invoices: () => `${API_BASE_URL}/invoices`,
		invoice: (id: string) => `${API_BASE_URL}/invoices/${id}`,
	},
	users: {
		list: () => `${API_BASE_URL}/users`,
		create: () => `${API_BASE_URL}/users`,
		update: (id: string) => `${API_BASE_URL}/users/${id}`,
		remove: (id: string) => `${API_BASE_URL}/users/${id}`,
	},
	reports: {
		revenue: () => `${API_BASE_URL}/reports/revenue`,
		performance: () => `${API_BASE_URL}/reports/performance`,
	},
	tickets: {
		list: () => `${API_BASE_URL}/tickets`,
		create: () => `${API_BASE_URL}/tickets`,
		update: (id: string) => `${API_BASE_URL}/tickets/${id}`,
	},
	notifications: {
		send: () => `${API_BASE_URL}/notifications`,
	},
} as const;


