import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    const { role } = await req.json();
    // Lưu role tạm thời vào cookie để callback session đọc được
    (await cookies()).set("forced_role", role, { path: "/", httpOnly: false });
    return NextResponse.json({ ok: true });
}


