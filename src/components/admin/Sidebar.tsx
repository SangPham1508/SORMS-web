"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Bars3Icon, HomeIcon, UserGroupIcon, BuildingOfficeIcon, CalendarDaysIcon, ClockIcon, BanknotesIcon, InboxIcon, BellAlertIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { Role } from "@/lib/auth";

export function Sidebar() {
	const pathname = usePathname();
    const { data } = useSession();
    const role = (data?.user?.role as Role | undefined) || undefined;
    const [collapsed, setCollapsed] = useState(false);

    // Expand by default on desktop, collapse on small screens
    useEffect(() => {
        const apply = () => setCollapsed(window.innerWidth < 768);
        apply();
        window.addEventListener("resize", apply);
        return () => window.removeEventListener("resize", apply);
    }, []);
    const Item = ({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon: React.ElementType }) => (
		<a
			className={clsx(
                "group relative flex items-center gap-2 px-2 py-2 rounded-md text-[14px]",
				collapsed ? "justify-center" : "",
				pathname === href ? "text-[var(--accent)]" : "text-[var(--foreground)] hover:bg-gray-200"
			)}
			href={href}
		>
			<Icon className="h-5 w-5" />
			<span className={clsx("relative", collapsed ? "hidden" : "")}>{children}</span>
			{pathname === href ? (
				<span className={clsx("absolute -left-2 top-1/2 -translate-y-1/2 h-5 w-1 rounded bg-[var(--accent)]", collapsed ? "hidden" : "")} />
			) : null}
		</a>
	);

	return (
        <aside className="h-screen bg-[var(--card)] border-r border-[var(--border)] px-3 py-4" style={{ width: collapsed ? 72 : 240 }}>
			<div className="flex items-center justify-between mb-4">
                <div className={clsx("text-lg font-semibold", collapsed ? "hidden" : "")}>SORMS</div>
                <button aria-label="Toggle sidebar" onClick={() => setCollapsed((v) => !v)} className="sm:hidden p-1 rounded hover:bg-gray-200">
					<Bars3Icon className="h-6 w-6" />
				</button>
			</div>
            <nav className="space-y-2 text-sm">
                <Item href="/admin" icon={HomeIcon}>Tổng quan</Item>
                <div className={clsx("mt-4 text-xs uppercase text-gray-500", collapsed ? "hidden" : "")}>Vận hành</div>
                <Item href="/admin/buildings" icon={BuildingOfficeIcon}>Nhà</Item>
                <Item href="/admin/rooms" icon={BuildingOfficeIcon}>Phòng</Item>
                <Item href="/admin/bookings" icon={CalendarDaysIcon}>Đặt phòng</Item>
                <Item href="/admin/history" icon={ClockIcon}>Lịch sử</Item>
                <div className={clsx("mt-4 text-xs uppercase text-gray-500", collapsed ? "hidden" : "")}>Kinh doanh</div>
                <Item href="/admin/services" icon={InboxIcon}>Dịch vụ</Item>
                <Item href="/admin/billing" icon={BanknotesIcon}>Hóa đơn</Item>
                <div className={clsx("mt-4 text-xs uppercase text-gray-500", collapsed ? "hidden" : "")}>Hệ thống & Con người</div>
                <Item href="/admin/users" icon={UserGroupIcon}>Người dùng</Item>
                <Item href="/admin/reports" icon={BellAlertIcon}>Báo cáo</Item>
			</nav>
		</aside>
	);
}


