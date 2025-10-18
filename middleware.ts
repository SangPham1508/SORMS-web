import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;
	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
	const roleFromToken = (token as any)?.role as string | undefined;
	const roleFromCookie = req.cookies.get("role")?.value;
	const role = roleFromToken || roleFromCookie;
	const email = (token as any)?.email as string | undefined;
	
	console.log('🔍 Middleware check:', {
		pathname,
		role,
		email,
		roleFromToken,
		roleFromCookie,
		cookies: req.cookies.getAll().map(c => `${c.name}=${c.value}`)
	});
	
	// Check if this is a role page
	const isRolePage = pathname.startsWith("/admin") || pathname.startsWith("/office") || 
	                   pathname.startsWith("/staff") || pathname.startsWith("/lecturer") || 
	                   pathname.startsWith("/guest");
	
	if (isRolePage) {
		console.log('🎯 Role page detected:', pathname);
		console.log('🔐 Authentication status:', { role, email, domainValid: !!email });
	}
	const testEmails = ["nguyenquyen220903@gmail.com"]; // Test emails
	const domainValid = !!email && (
		email.toLowerCase().endsWith("@fpt.edu.vn") || 
		email.toLowerCase().endsWith("@fe.edu.vn") ||
		email.toLowerCase().endsWith("@gmail.com") || // Allow all Gmail
		testEmails.includes(email.toLowerCase())
	);
	
	console.log('🌐 Domain validation:', { 
		email, 
		domainValid, 
		isFpt: email?.toLowerCase().endsWith("@fpt.edu.vn"),
		isFe: email?.toLowerCase().endsWith("@fe.edu.vn"),
		isGmail: email?.toLowerCase().endsWith("@gmail.com"),
		isTestEmail: testEmails.includes(email?.toLowerCase() || "")
	});
	const approvedCookie = req.cookies.get("approved")?.value === "true";
	const active = (token as any)?.active as boolean | undefined;
	const isApproved = active ?? approvedCookie ?? true; // Allow test emails by default

	const needsStrictAccess = pathname.startsWith("/admin") || pathname.startsWith("/office");
	const needsRoleAccess = pathname.startsWith("/staff") || pathname.startsWith("/lecturer") || pathname.startsWith("/guest");
	
	if (needsStrictAccess) {
		const isAdmin = role === "admin";
		const isOffice = role === "office";
		const allowedByRole = isAdmin || isOffice;
		const allowedByDomain = domainValid; // only FPT/FE domains can access admin/office
		console.log('🔒 Strict access check:', { isAdmin, isOffice, allowedByRole, allowedByDomain, isApproved });
		if (!allowedByRole || !allowedByDomain || !isApproved) {
			console.log('❌ Redirecting to login from strict access');
			const url = req.nextUrl.clone();
			url.pathname = "/login";
			url.searchParams.set("next", pathname);
			return NextResponse.redirect(url);
		}
	}
	
	if (needsRoleAccess) {
		const isStaff = role === "staff";
		const isLecturer = role === "lecturer";
		const isGuest = role === "guest";
		const allowedByRole = isStaff || isLecturer || isGuest;
		const allowedByDomain = domainValid; // FPT/FE domains or test emails
		console.log('👥 Role access check:', { isStaff, isLecturer, isGuest, allowedByRole, allowedByDomain, isApproved });
		if (!allowedByRole || !allowedByDomain || !isApproved) {
			console.log('❌ Redirecting to login from role access');
			const url = req.nextUrl.clone();
			url.pathname = "/login";
			url.searchParams.set("next", pathname);
			return NextResponse.redirect(url);
		}
	}
	return NextResponse.next();
}

export const config = {
	matcher: ["/admin/:path*", "/office/:path*", "/staff/:path*", "/lecturer/:path*", "/guest/:path*"],
};


