"use client";

export function QuickActions() {
	return (
		<div className="flex flex-wrap gap-3 items-center">
			<a className="btn-primary rounded px-4 py-2" href="/admin/bookings">Tạo Booking mới</a>
			<a className="btn-primary rounded px-4 py-2" href="/admin/rooms">Thêm phòng</a>
			<button className="rounded px-3 py-2 border" onClick={() => alert("Báo cáo: mở popup (sẽ thay bằng modal/biểu đồ)")}>Báo cáo</button>
			<button className="rounded px-3 py-2 border" onClick={() => alert("Hỗ trợ: mở popup (sẽ thay bằng modal biểu mẫu)")}>Hỗ trợ</button>
		</div>
	);
}


