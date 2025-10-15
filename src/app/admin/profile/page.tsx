"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function ProfilePage() {
    const { data } = useSession();
    const [name, setName] = useState("");
    const email = (data?.user?.email as string) || "";
    const role = (data?.user as any)?.role as string | undefined;

    useEffect(() => {
        setName((data?.user?.name as string) || "");
    }, [data?.user?.name]);

    function save() {
        // Mock save only for UI demo; integrate API later
        alert("Cập nhật thông tin cá nhân thành công.");
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Thông tin cá nhân</h1>
            <div className="grid max-w-xl gap-4">
                <label className="grid gap-1">
                    <span className="text-sm text-gray-600">Họ và tên</span>
                    <input className="border rounded-md px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label className="grid gap-1">
                    <span className="text-sm text-gray-600">Email</span>
                    <input className="border rounded-md px-3 py-2 bg-gray-50" value={email} disabled />
                </label>
                <label className="grid gap-1">
                    <span className="text-sm text-gray-600">Vai trò</span>
                    <input className="border rounded-md px-3 py-2 bg-gray-50" value={role || ""} disabled />
                </label>
                <div className="pt-2">
                    <button className="rounded-md bg-orange-500 hover:bg-orange-600 text-white px-4 py-2" onClick={save}>Lưu thay đổi</button>
                </div>
            </div>
        </div>
    );
}


