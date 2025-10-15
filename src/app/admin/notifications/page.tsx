"use client";

import { useState } from "react";

export default function NotificationsPage() {
	const [target, setTarget] = useState<"all" | "user">("all");
	const [userId, setUserId] = useState("");
	const [message, setMessage] = useState("");

	function send() {
		// Placeholder: integrate with ENDPOINTS.notifications.send
		alert(`Đã gửi: ${target === "all" ? "Toàn hệ thống" : "User " + userId} -> ${message}`);
		setMessage("");
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Hệ thống Thông báo</h1>
			<div className="grid gap-3 max-w-xl">
				<select className="border rounded px-3 py-2" value={target} onChange={(e) => setTarget(e.target.value as any)}>
					<option value="all">Gửi toàn hệ thống</option>
					<option value="user">Gửi đến cá nhân</option>
				</select>
				{target === "user" ? (
					<input className="border rounded px-3 py-2" placeholder="User ID/Email" value={userId} onChange={(e) => setUserId(e.target.value)} />
				) : null}
				<textarea className="border rounded px-3 py-2" placeholder="Nội dung thông báo" value={message} onChange={(e) => setMessage(e.target.value)} />
				<button className="bg-foreground text-background rounded px-3 py-2" onClick={send}>Gửi thông báo</button>
			</div>
		</div>
	);
}


