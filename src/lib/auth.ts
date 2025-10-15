export type Role =
	| "admin"
	| "admin_office"
	| "lecture"
	| "guest"
	| "staff";

export const ROLE_LABELS: Record<Role, string> = {
	admin: "Admin",
	admin_office: "Phòng Hành Chính",
	lecture: "Lecture",
	guest: "Khách",
	staff: "Nhân viên",
};

export function isAllowed(pathname: string, role: Role | null): boolean {
	if (!role) return false;
	// Protect admin area for privileged roles
	if (pathname.startsWith("/admin")) {
		return role === "admin" || role === "admin_office";
	}
	return true;
}

export function getEmailFromSession(session: any): string | null {
	return session?.user?.email ?? null;
}

export function mapEmailToRole(email: string | null | undefined): Role {
	if (!email) return "guest";
	const lower = email.toLowerCase();
	// Adjust these rules to your domain/policy
    if (lower.endsWith("@fpt.edu.vn") || lower.endsWith("@fe.edu.vn")) return "admin_office";
    return "staff";
}


