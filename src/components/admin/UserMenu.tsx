"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";

export function UserMenu({
	name,
	email,
	role,
	image,
}: {
	name?: string | null;
	email?: string | null;
	role?: string | null;
	image?: string | null;
}) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function onDoc(e: MouseEvent) {
			if (!ref.current) return;
			if (!ref.current.contains(e.target as Node)) setOpen(false);
		}
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	}, []);

	const displayName = name || email || "User";
	const avatar = image || undefined;

	return (
		<div className="relative" ref={ref}>
			<button className="flex items-center gap-2" onClick={() => setOpen((v) => !v)}>
				{avatar ? (
					<img src={avatar} alt={displayName ?? "avatar"} className="h-8 w-8 rounded-full object-cover" />
				) : (
					<div className="h-8 w-8 rounded-full bg-gray-300" />
				)}
				<span className="hidden sm:inline text-[var(--foreground)] text-sm font-medium">{displayName}</span>
			</button>
			{open ? (
				<div className="absolute right-0 mt-2 w-56 rounded-md border border-[var(--border)] bg-[var(--card)] shadow-lg p-3 text-sm">
					<div className="font-semibold mb-1">{displayName}</div>
					<div className="text-[var(--muted)] break-all">{email}</div>
					{role ? <div className="mt-2"><span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{role}</span></div> : null}
					<div className="mt-3 border-t pt-2 space-y-1">
						<a href="/admin/profile" className="block hover:underline">Thông tin cá nhân</a>
						<button className="block text-left w-full text-red-600 hover:underline" onClick={() => signOut({ callbackUrl: "/" })}>Đăng xuất</button>
					</div>
				</div>
			) : null}
		</div>
	);
}


