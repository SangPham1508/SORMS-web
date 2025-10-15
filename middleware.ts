import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;
	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const role = (token as any)?.role as string | undefined;
    const active = (token as any)?.active as boolean | undefined;
    if (pathname.startsWith("/admin")) {
        const allowedRole = role === "admin" || role === "admin_office" || role === "staff";
        const mustBeApproved = role === "admin_office" || role === "staff";
        const isApproved = mustBeApproved ? !!active : true;
        const isDeniedByRole = !role || role === "guest" || role === "lecture";
        if (isDeniedByRole || !allowedRole || !isApproved) {
            const url = req.nextUrl.clone();
            url.pathname = "/login";
            url.searchParams.set("next", pathname);
            return NextResponse.redirect(url);
        }
    }
	return NextResponse.next();
}

export const config = {
	matcher: ["/admin/:path*"],
};


