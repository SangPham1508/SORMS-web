import { ROLE_LABELS, type Role } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { UserMenu } from "@/components/admin/UserMenu";
import { BellPopover } from "@/components/admin/BellPopover";

export async function Header() {
	const session = await getServerSession(authOptions);
	const role = (session?.user?.role as Role | undefined) || undefined;
	return (
        <header className="h-16 border-b border-[var(--border)] bg-[var(--card)] flex items-center px-4 sm:px-6 justify-between gap-4">
            <div className="font-semibold tracking-tight text-[var(--foreground)]">Admin Dashboard</div>
            <div className="flex-1" />
            <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
                <button aria-label="Open menu" className="sm:hidden p-1 rounded hover:bg-gray-200"><Bars3Icon className="h-6 w-6" /></button>
                <BellPopover />
                <UserMenu name={session?.user?.name} email={session?.user?.email} role={role ? ROLE_LABELS[role] : undefined} image={session?.user?.image} />
                <span>v0.1.0</span>
            </div>
        </header>
	);
}


