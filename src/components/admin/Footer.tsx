export function Footer() {
	return (
		<footer className="mt-8 border-t border-[var(--border)] text-[var(--muted)] text-sm px-4 sm:px-6 py-4">
			<div className="mx-auto max-w-[1200px] flex flex-col sm:flex-row items-center justify-between gap-2">
				<div>© {new Date().getFullYear()} SORMS — Hệ thống quản lý nhà công vụ</div>
				<div className="flex items-center gap-4">
					<a className="link-accent underline" href="/admin/reports">Báo cáo</a>
					<a className="underline" href="/admin/tickets">Hỗ trợ</a>
				</div>
			</div>
		</footer>
	);
}


