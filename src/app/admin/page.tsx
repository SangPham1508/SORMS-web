import { QuickActions } from "@/components/admin/QuickActions";
import { TicketCreateButton } from "@/components/admin/TicketCreateButton";
import { RevenueChart } from "@/components/admin/charts/RevenueChart";
import { getRevenueSeries } from "@/lib/services/reports";
import { listRooms } from "@/lib/services/rooms";
import { listBookings } from "@/lib/services/bookings";
import { listInvoices } from "@/lib/services/billing";
import { listTickets } from "@/lib/services/tickets";

export default async function AdminHome() {
    const [rev, rooms, bookings, invoices, tickets] = await Promise.all([
        getRevenueSeries(),
        listRooms(),
        listBookings(),
        listInvoices(),
        listTickets(),
    ]);

    const totalRooms = rooms.length;
    const occupied = rooms.filter((r) => r.status === "occupied").length;
    const available = rooms.filter((r) => r.status === "available").length;
    const occupancy = totalRooms ? Math.round((occupied / totalRooms) * 100) : 0;
    const todayBookings = bookings.length;
    const openTickets = tickets.filter((t) => t.status !== "done").length;
    const monthRevenue = rev.reduce((s, p) => s + p.revenue, 0);
    const half = Math.floor(rev.length / 2) || 1;
    const prevRevenue = rev.slice(0, half).reduce((s, p) => s + p.revenue, 0);
    const currRevenue = rev.slice(half).reduce((s, p) => s + p.revenue, 0);
    const revenueDelta = prevRevenue > 0 ? ((currRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const todayIso = new Date().toISOString().slice(0, 10);
    const checkoutToday = bookings.filter((b) => b.end.slice(0, 10) === todayIso);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Tổng quan</h1>
                <div className="flex items-center gap-3"><QuickActions /></div>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-6">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm flex items-start justify-between">
                    <div>
                        <div className="text-sm text-[var(--muted)]">Tỷ lệ lấp đầy</div>
                        <div className="text-2xl font-bold">{occupancy}% <span className="text-sm text-[var(--muted)]">({occupied}/{totalRooms})</span></div>
                    </div>
                    <div aria-hidden>📊</div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm flex items-start justify-between">
                    <div>
                        <div className="text-sm text-[var(--muted)]">Phòng trống</div>
                        <div className="text-2xl font-bold">{available}</div>
                    </div>
                    <div aria-hidden>🔑</div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm flex items-start justify-between">
                    <div>
                        <div className="text-sm text-[var(--muted)]">Đang ở</div>
                        <div className="text-2xl font-bold">{occupied}</div>
                    </div>
                    <div aria-hidden>🛏️</div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm flex items-start justify-between">
                    <div>
                        <div className="text-sm text-[var(--muted)]">Đặt phòng hôm nay</div>
                        <div className="text-2xl font-bold">{todayBookings}</div>
                    </div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm flex items-start justify-between">
                    <div>
                        <div className="text-sm text-[var(--muted)]">Doanh thu (tháng)</div>
                        <div className="text-2xl font-bold">{monthRevenue.toLocaleString("vi-VN", { style: "currency", currency: "VND" })} <span className={revenueDelta>=0?"text-green-600":"text-red-600"} style={{fontSize: "0.8em"}}>{revenueDelta>=0?"▲":"▼"} {Math.abs(revenueDelta).toFixed(1)}%</span></div>
                    </div>
                    <div aria-hidden>💰</div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm flex items-start justify-between">
                    <div>
                        <div className="text-sm text-[var(--muted)]">Ticket mở</div>
                        <div className="text-2xl font-bold">{openTickets}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
                    <div className="text-sm text-[var(--muted)] mb-2">Doanh thu 30 ngày</div>
                    <RevenueChart data={rev} />
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
                    <div className="text-sm text-[var(--muted)] mb-2">Hóa đơn gần đây</div>
                    <div className="divide-y max-h-72 overflow-auto">
                        {invoices.slice(0, 8).map((i) => (
                            <div key={i.id} className="flex items-center justify-between py-2 text-sm">
                                <div className="font-medium">{i.customerName}</div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${i.status==='paid'?'bg-blue-100 text-blue-700':i.status==='unpaid'?'bg-amber-100 text-amber-700':'bg-gray-100 text-gray-600'}`}>
                                        {i.status==='paid' ? `Đã thanh toán${(i as any).paymentMethod ? ' – ' + ((i as any).paymentMethod==='cash'?'Tiền mặt':'Chuyển khoản') : ''}` : i.status==='unpaid'?'Chờ thanh toán':'Hủy'}
                                    </span>
                                    <span>{i.total.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-[var(--muted)]">Ticket gần đây</div>
                        <TicketCreateButton />
                    </div>
                    <div className="divide-y max-h-72 overflow-auto text-sm">
                        {tickets.slice(0, 10).map((t) => (
                            <div key={t.id} className="flex items-center justify-between py-2">
                                <div>
                                    <div className="font-medium">{t.title}</div>
                                    {t.assignee ? <div className="text-[11px] text-[var(--muted)]">Phụ trách: {t.assignee}</div> : null}
                                </div>
                                <div className={`text-[11px] px-2 py-0.5 rounded-full ${t.status==='done'?'badge-done':t.status==='in_progress'?'badge-processing':'badge-cancelled'}`}>
                                    {t.status==='open'?'Mở':t.status==='in_progress'?'Đang xử lý':'Hoàn tất'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
                    <div className="text-sm text-[var(--muted)] mb-2">Dự kiến check‑out hôm nay</div>
                    <div className="divide-y max-h-72 overflow-auto text-sm">
                        {checkoutToday.length === 0 ? (
                            <div className="py-2 text-[var(--muted)]">Không có lịch check‑out hôm nay</div>
                        ) : (
                            checkoutToday.map((b) => (
                                <div key={b.id} className="flex items-center justify-between py-2">
                                    <div className="font-medium">{b.roomName}</div>
                                    <div className="text-[var(--muted)]">{b.customerName}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


