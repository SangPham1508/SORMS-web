import { listHistories } from "@/lib/services/history";
import { SimpleTable } from "@/components/admin/operations/SimpleTable";
import { HistoryFilters } from "@/components/admin/operations/HistoryFilters";
import type { HistoryItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
	const histories = await listHistories();
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold tracking-tight">Quản lý Lịch sử</h1>
			<p className="text-sm text-gray-500">Lịch sử check-in/check-out và dịch vụ</p>
			<HistoryFilters items={histories} />
			<SimpleTable
				headers={["Khách hàng", "Loại", "Thời gian", "Ghi chú"]}
				rows={histories.map((h: HistoryItem) => [h.customerName, h.type, h.timestamp, h.note || "-"])}
			/>
		</div>
	);
}


