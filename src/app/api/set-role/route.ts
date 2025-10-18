import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { role } = await request.json().catch(() => ({ role: undefined }));
  if (!role) return NextResponse.json({ error: "Missing role" }, { status: 400 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("role", role, { path: "/", httpOnly: false, sameSite: "lax" });
  return res;
}


