import { ENDPOINTS } from "@/lib/config";
import { http } from "@/lib/http";
import type { RevenuePoint, PerformanceReport } from "@/lib/types";

export async function getRevenueSeries(): Promise<RevenuePoint[]> {
	// return await http<RevenuePoint[]>(ENDPOINTS.reports.revenue());
	const now = new Date();
	return Array.from({ length: 7 }).map((_, i) => {
		const d = new Date(now.getTime() - (6 - i) * 24 * 3600_000).toISOString().slice(0, 10);
		return { date: d, revenue: Math.round(Math.random() * 2_000_000) };
	});
}

export async function getPerformance(): Promise<PerformanceReport> {
	// return await http<PerformanceReport>(ENDPOINTS.reports.performance());
	return {
		occupancyRate: 0.72,
		revpar: 450000,
		topServices: [
			{ name: "Bữa sáng", count: 120 },
			{ name: "Giặt ủi", count: 95 },
			{ name: "Đưa đón", count: 30 },
		],
	};
}


