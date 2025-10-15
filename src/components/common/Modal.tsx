"use client";

import { useEffect } from "react";

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		if (open) document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, onClose]);

	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50">
			<div className="absolute inset-0 bg-black/30" onClick={onClose} />
			<div className="absolute inset-0 flex items-center justify-center p-4">
				<div className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg">
					<div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
						<h3 className="font-semibold">{title}</h3>
						<button onClick={onClose} className="px-2 py-1 rounded hover:bg-gray-200">✕</button>
					</div>
					<div className="p-4">
						{children}
					</div>
				</div>
			</div>
		</div>
	);
}


