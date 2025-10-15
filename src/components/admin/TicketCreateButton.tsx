"use client";

import { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { createTicket } from "@/lib/services/tickets";

export function TicketCreateButton({ onCreated }: { onCreated?: () => void }) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [assignee, setAssignee] = useState("");
	const [loading, setLoading] = useState(false);

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		await createTicket({ title, description, assignee });
		setLoading(false);
		setOpen(false);
		setTitle("");
		setDescription("");
		setAssignee("");
		onCreated?.();
	}

	return (
		<>
			<button className="btn-primary rounded px-4 py-2" onClick={() => setOpen(true)}>Tạo Ticket</button>
			<Modal open={open} title="Tạo Ticket" onClose={() => setOpen(false)}>
				<form onSubmit={submit} className="grid grid-cols-1 gap-3">
					<input className="border rounded px-3 py-2" placeholder="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} />
					<textarea className="border rounded px-3 py-2" placeholder="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} />
					<input className="border rounded px-3 py-2" placeholder="Giao cho (user/email)" value={assignee} onChange={(e) => setAssignee(e.target.value)} />
					<div className="flex justify-end gap-2">
						<button type="button" className="px-4 py-2 rounded border" onClick={() => setOpen(false)}>Hủy</button>
						<button className="btn-primary rounded px-4 py-2" disabled={loading}>Tạo</button>
					</div>
				</form>
			</Modal>
		</>
	);
}


