import { getRevenueSeries, getPerformance } from "@/lib/services/reports";
import { RevenueChart } from "@/components/admin/charts/RevenueChart";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
	const [rev, perf] = await Promise.all([getRevenueSeries(), getPerformance()]);
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Báo cáo & Phân tích</h1>
            <div className="card p-4">
                <div className="text-sm text-gray-500 mb-2">Doanh thu 7 ngày</div>
                <RevenueChart data={rev} />
            </div>
			<div className="rounded-lg border p-4 space-y-2">
				<div>Tỷ lệ lấp đầy: {(perf.occupancyRate * 100).toFixed(1)}%</div>
				<div>RevPAR: {perf.revpar.toLocaleString()}</div>
				<div>
					Dịch vụ ưa thích:
					<ul className="list-disc pl-6">
						{perf.topServices.map((s) => (
							<li key={s.name}>{s.name}: {s.count}</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}


