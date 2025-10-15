export function SimpleTable({
	headers,
	rows,
}: {
	headers: string[];
	rows: (string | number)[][];
}) {
	return (
		<div className="overflow-auto rounded-lg border border-[var(--border)]">
			<table className="min-w-full text-sm table">
				<thead className="bg-[var(--card)] text-left">
					<tr>
						{headers.map((h) => (
							<th key={h} className="px-4 py-2 font-medium text-gray-600">
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((r, i) => (
						<tr key={i} className="border-t">
							{r.map((c, j) => (
								<td key={j} className="px-4 py-2">
									{c}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}


