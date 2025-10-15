"use client";

import { useState, useRef, useEffect } from "react";
import { listReceived } from "@/lib/services/notifications";
import { useSession } from "next-auth/react";
import { BellIcon } from "@heroicons/react/24/outline";

type Notice = { id: string; title: string; time: string; read?: boolean };

export function BellPopover() {
	const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Notice[]>([]);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function onDoc(e: MouseEvent) {
			if (!ref.current) return;
			if (!ref.current.contains(e.target as Node)) setOpen(false);
		}
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	}, []);

    const { data, status } = useSession();
    useEffect(() => {
        const email = (data?.user?.email as string) || "me@example.com";
        listReceived(email).then((list) => setItems(list.map((n) => ({ id: n.id, title: n.message, time: new Date(n.createdAt).toLocaleString() }))));
        if (status === "authenticated") {
            // Thêm thông báo 1 lần khi đăng nhập thành công
            setItems((prev) => [{ id: "login-success", title: "Đăng nhập thành công", time: new Date().toLocaleString() }, ...prev]);
            // Mở popover lần đầu sau đăng nhập
            if (typeof window !== "undefined" && !sessionStorage.getItem("openedAfterLogin")) {
                setOpen(true);
                sessionStorage.setItem("openedAfterLogin", "1");
            }
        }
    }, [data?.user?.email, status]);

    const unread = items.some((i) => !i.read);

	return (
		<div className="relative" ref={ref}>
			<button aria-label="Notifications" className="p-1 rounded hover:bg-gray-200 relative" onClick={() => setOpen((v) => !v)}>
				<BellIcon className="h-6 w-6" />
				{unread ? <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" /> : null}
			</button>
            {open ? (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[var(--border)] bg-white shadow-xl p-0 text-sm">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <div className="font-semibold">Notification</div>
                        <button aria-label="Close" className="text-[var(--muted)] hover:underline" onClick={() => setOpen(false)}>×</button>
                    </div>
                    <div className="max-h-80 overflow-auto">
                        {items.map((n) => (
                            <div key={n.id} className="px-4 py-3 hover:bg-gray-50">
                                <div className="flex items-start gap-3">
                                    <div className="relative h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">🔔
                                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[var(--foreground)] leading-snug">
                                            {n.title}
                                        </div>
                                        <div className="text-[11px] text-[var(--muted)] mt-0.5">{n.time}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="px-4 py-3 border-t bg-white">
                        <a href="/admin/notifications" className="w-full block text-center rounded-md border px-3 py-2 hover:bg-gray-50">View All Notifications</a>
                    </div>
                </div>
            ) : null}
		</div>
	);
}


