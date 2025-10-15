import { BookingTimeline } from "@/components/admin/operations/BookingTimeline";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold tracking-tight">Quản lý Đặt phòng</h1>
			<p className="text-sm text-gray-500">Timeline đặt phòng và lọc theo ngày</p>
			<BookingTimeline />
		</div>
	);
}


