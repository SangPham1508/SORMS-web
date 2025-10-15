"use client";

import { useEffect, useState } from "react";
import { listUsers, createUser } from "@/lib/services/users";
import { addAdminHistory } from "@/lib/services/history";

export default function UsersPage() {
    const [users, setUsers] = useState<Array<{id:string;name:string;email:string;role:string;active:boolean}>>([]);
    useEffect(() => { listUsers().then(setUsers); }, []);
    async function lock(uId: string) {
        setUsers((prev) => prev.map((u) => (u.id === uId ? { ...u, active: false } : u)));
        await addAdminHistory(`Khóa tài khoản ${uId}`);
    }
    async function activate(uId: string) {
        setUsers((prev) => prev.map((u) => (u.id === uId ? { ...u, active: true } : u)));
        await addAdminHistory(`Kích hoạt tài khoản ${uId}`);
    }
    async function createNew() {
        const name = prompt("Tên") || "";
        const email = prompt("Email") || "";
        const role = prompt("Vai trò (admin/admin_office/staff)") || "staff";
        if (!name || !email) return;
        const created = await createUser({ name, email, role, active: true });
        setUsers((prev) => [created, ...prev]);
        await addAdminHistory(`Tạo tài khoản ${email}`);
    }
    return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Người dùng & Phân quyền</h1>
            <div className="flex justify-end"><button className="btn-primary rounded px-4 py-2" onClick={createNew}>Tạo người dùng</button></div>
            <div className="overflow-auto rounded-lg border">
				<table className="min-w-full text-sm">
					<thead className="bg-gray-50 text-left">
						<tr>
							<th className="px-4 py-2">Tên</th>
							<th className="px-4 py-2">Email</th>
							<th className="px-4 py-2">Vai trò</th>
                            <th className="px-4 py-2">Trạng thái</th>
                            <th className="px-4 py-2">Hành động</th>
						</tr>
					</thead>
					<tbody>
                        {users.map((u) => (
							<tr key={u.id} className="border-t">
								<td className="px-4 py-2 font-medium">{u.name}</td>
								<td className="px-4 py-2">{u.email}</td>
								<td className="px-4 py-2">{u.role}</td>
                                <td className="px-4 py-2">{u.active ? "Hoạt động" : "Khóa"}</td>
                                <td className="px-4 py-2 space-x-2">
                                    {u.active ? (
                                        <button className="underline btn-danger" onClick={() => lock(u.id)}>Khóa</button>
                                    ) : (
                                        <button className="underline" onClick={() => activate(u.id)}>Kích hoạt</button>
                                    )}
                                </td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}


