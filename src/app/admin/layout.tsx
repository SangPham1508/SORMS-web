import { Header } from "@/components/admin/Header";
import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen grid grid-cols-[240px,1fr]" style={{ gridTemplateColumns: "240px 1fr" }}>
            <Sidebar />
            <div className="min-h-screen flex flex-col">
                {/* Header is an async Server Component */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {/* @ts-ignore Async Server Component */}
                <Header />
                <main className="p-4 sm:p-6 bg-[var(--background)] flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}


