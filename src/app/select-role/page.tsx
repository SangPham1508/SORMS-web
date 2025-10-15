"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

const ROLES = [
	{ key: "admin", label: "Admin" },
	{ key: "hanhchinh", label: "Hành chính" },
	{ key: "letan", label: "Lễ tân" },
	{ key: "dondep", label: "Dọn dẹp" },
];

export default function SelectRolePage() {
	const { data } = useSession();
	const router = useRouter();
	const sp = useSearchParams();
	const cb = sp.get("callbackUrl") || "/admin";

	async function choose(role: string) {
		await fetch("/api/auth/set-role", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ role }),
		});
		router.push(cb);
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-6">
			<div className="w-full max-w-md border rounded-xl p-6 shadow-sm bg-white">
				<h1 className="text-xl font-semibold">Chọn vai trò</h1>
				<p className="text-sm text-gray-600 mt-1">Đăng nhập: {data?.user?.email}</p>
				<div className="mt-4 grid grid-cols-2 gap-3">
					{ROLES.map((r) => (
						<button key={r.key} className="rounded-md border px-3 py-2 hover:bg-gray-50" onClick={() => choose(r.key)}>
							{r.label}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}


