import { RoomsManager } from "@/components/admin/operations/RoomsManager";

export const dynamic = "force-dynamic";

export default async function RoomsPage() {
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold tracking-tight">Quản lý Phòng</h1>
			<p className="text-sm text-gray-500">Thêm/Sửa/Xóa phòng và xem sơ đồ</p>
			<RoomsManager />
		</div>
	);
}


