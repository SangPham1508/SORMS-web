"use client";

import { useState, useRef, useEffect } from "react";
import { createNotification } from "@/lib/services/notifications";
import { useSession } from "next-auth/react";

type ChatMessage = { id: string; from: "me" | "support"; text: string; time: string };

export function ChatWidget() {
    const { data } = useSession();
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [target, setTarget] = useState<"all" | "user">("all");
    const [user, setUser] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: "w1", from: "support", text: "Xin chào! Tôi có thể giúp gì?", time: new Date().toLocaleTimeString() },
    ]);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open]);

    async function send() {
        if (!input.trim()) return;
        const now = new Date().toLocaleTimeString();
        setMessages((prev) => [...prev, { id: Math.random().toString(36).slice(2), from: "me", text: input.trim(), time: now }]);
        setInput("");
        // ghi log gửi (mock)
        const senderEmail = (data?.user?.email as string) || "me@example.com";
        const recipient = target === "user" ? (user || senderEmail) : undefined;
        await createNotification({ message: input.trim(), sender: senderEmail, target: target === "all" ? { type: "all" } : { type: "user", recipient: recipient as string } });
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {open ? (
                <div className="w-[320px] sm:w-[380px] h-[440px] rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-xl flex flex-col overflow-hidden">
                    <div className="px-3 py-2 border-b border-[var(--border)] flex items-center justify-between">
                        <div className="font-semibold">Hỗ trợ</div>
                        <button className="px-2 py-1 rounded hover:bg-gray-200" onClick={() => setOpen(false)}>✕</button>
                    </div>
                    <div className="flex-1 p-3 space-y-2 overflow-auto">
                        {messages.map((m) => (
                            <div key={m.id} className={m.from === "me" ? "text-right" : "text-left"}>
                                <div className={"inline-block px-3 py-2 rounded-lg " + (m.from === "me" ? "bg-[var(--accent)] text-white" : "bg-gray-100 text-[var(--foreground)]")}>{m.text}</div>
                                <div className="text-[11px] text-[var(--muted)] mt-0.5">{m.time}</div>
                            </div>
                        ))}
                        <div ref={endRef} />
                    </div>
                    <form
                        className="p-3 border-t border-[var(--border)] flex items-center gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            send();
                        }}
                    >
                        <select className="border rounded px-2 py-2 text-sm" value={target} onChange={(e) => setTarget(e.target.value as any)}>
                            <option value="all">Tất cả</option>
                            <option value="user">Cá nhân</option>
                        </select>
                        {target === "user" ? (
                            <input className="border rounded px-2 py-2 text-sm w-[120px]" placeholder="User/email" value={user} onChange={(e) => setUser(e.target.value)} />
                        ) : null}
                        <input
                            className="flex-1 border rounded px-3 py-2"
                            placeholder="Nhập tin nhắn..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" className="btn-primary rounded px-3 py-2">Gửi</button>
                    </form>
                </div>
            ) : null}
            <button
                aria-label="Open chat"
                className="mt-3 rounded-full h-12 w-12 shadow-lg bg-[var(--accent)] text-white flex items-center justify-center"
                onClick={() => setOpen((v) => !v)}
            >
                💬
            </button>
        </div>
    );
}


