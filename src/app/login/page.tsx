"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
	const router = useRouter();
	const sp = useSearchParams();
    const [role, setRole] = useState("guest");

    function signInWithRole() {
        // Lưu role được chọn để NextAuth đọc trong callback
        document.cookie = `forced_role=${role}; path=/`;
        const callbackUrl = sp.get("next") || "/admin";
        signIn("google", { callbackUrl });
    }

	return (
		<div className="min-h-screen flex items-center justify-center p-6">
    <div className="w-full max-w-md space-y-4 border rounded-lg p-6">
            <h1 className="text-xl font-semibold">Đăng nhập</h1>
            <button className="bg-foreground text-background rounded px-3 py-2 w-full" onClick={signInWithRole}>Đăng nhập với Google</button>
            <div className="h-px bg-gray-200" />
            <h2 className="text-sm text-gray-600">(Tùy chọn) Chọn vai trò mock</h2>
				<select className="border rounded px-3 py-2 w-full" value={role} onChange={(e) => setRole(e.target.value)}>
					<option value="admin">Admin</option>
					<option value="admin_office">Phòng Hành Chính</option>
					<option value="lecture">Lecture</option>
					<option value="guest">Khách</option>
					<option value="staff">Nhân viên</option>
				</select>
                
			</div>
		</div>
	);
}


