"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

type Point = { date: string; revenue: number };

export function RevenueChart({ data }: { data: Point[] }) {
	return (
		<div className="h-56">
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
					<defs>
						<linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#F97316" stopOpacity={0.6} />
							<stop offset="95%" stopColor="#F97316" stopOpacity={0.05} />
						</linearGradient>
					</defs>
					<XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={8} />
					<YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${Math.round((v as number) / 1000)}k`} width={40} />
					<Tooltip formatter={(v: number) => v.toLocaleString()} />
					<Area type="monotone" dataKey="revenue" stroke="#F97316" fill="url(#rev)" strokeWidth={2} />
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}


