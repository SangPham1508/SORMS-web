"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getDashboardData, getTimeSeriesData } from '@/lib/mock-data'
import Badge from '@/components/ui/Badge'

// ===== Types =====
type RangeKey = "7" | "14" | "30";
type OccupancyResp = { total: number; occupied: number };
type BookingsResp = { pending: number; series: { date: string; count: number }[] };
type CheckinsResp = { series: { date: string; count: number }[] };
type PaymentsResp = { count: number; sum: number; series: { date: string; sum: number }[] };
type ServicesResp = { top: { name: string; count: number }[] };
type TasksResp = { todo: number; in_progress: number; done: number; cancelled: number };

// ===== Helpers =====
const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("vi-VN", { month: "2-digit", day: "2-digit" });

// ===== UI Components =====

function Card({ title, actions, children, className = "" }: { title?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl sm:rounded-2xl border bg-white shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow ${className}`}>
      {(title || actions) && (
        <div className="mb-3 sm:mb-4 flex items-center justify-between">
          {title && <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

function KPICard({ title, value, hint, icon, trend, color = "blue" }: { 
  title: string; 
  value: string; 
  hint?: string; 
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color?: "gray" | "green" | "yellow" | "red" | "blue" | "orange" | "purple";
}) {
  const colorClasses = {
    gray: "bg-white border-gray-200 text-gray-700",
    green: "bg-green-50 border-green-200 text-green-800", 
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
    red: "bg-red-50 border-red-200 text-red-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800"
  };
  
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 sm:p-6 hover:shadow-md transition-all duration-200 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="text-xs sm:text-sm font-medium text-gray-600">{title}</div>
        {icon && <div className="text-xl sm:text-2xl opacity-80">{icon}</div>}
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{value}</div>
      {hint && <div className="text-xs sm:text-sm text-gray-500">{hint}</div>}
      {trend && (
        <div className={`mt-1 sm:mt-2 text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
}

function RangeSelector({ range, setRange }: { range: RangeKey; setRange: (r: RangeKey) => void }) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1" role="tablist" aria-label="Khoảng ngày">
      {(["7", "14", "30"] as const).map((r) => (
        <button
          key={r}
          role="tab"
          aria-selected={range === r}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
            range === r 
              ? "bg-white text-gray-900 border border-gray-300 shadow-sm" 
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
          onClick={() => setRange(r)}
        >
          {r} ngày
        </button>
      ))}
    </div>
  );
}

// ===== Enhanced Charts =====

function useTooltip() {
  const [tip, setTip] = useState<{ x: number; y: number; label: string } | null>(null);
  const show = (x: number, y: number, label: string) => setTip({ x, y, label });
  const hide = () => setTip(null);
  return { tip, show, hide } as const;
}

function Axis({ w, h, pad }: { w: number; h: number; pad: number }) {
  return (
    <g>
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#e5e7eb" strokeWidth="2" />
      <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#e5e7eb" strokeWidth="2" />
    </g>
  );
}

function Grid({ w, h, pad, rows = 4 }: { w: number; h: number; pad: number; rows?: number }) {
  const gh = (h - 2 * pad) / rows;
  return (
    <g>
      {Array.from({ length: rows + 1 }).map((_, i) => (
        <line key={i} x1={pad} y1={pad + i * gh} x2={w - pad} y2={pad + i * gh} stroke="#f8fafc" strokeWidth="1" />
      ))}
    </g>
  );
}

function LineChart({ series, color = "#3b82f6" }: { series: { date: string; count: number }[]; color?: string }) {
  if (!series?.length) return <Empty />;
  const w = 560, h = 200, pad = 28;
  const maxY = Math.max(...series.map((s) => s.count), 1);
  const stepX = (w - 2 * pad) / Math.max(1, series.length - 1);
  const pts = series.map((s, i) => ({ x: pad + i * stepX, y: h - pad - (s.count * (h - 2 * pad)) / maxY }));
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
  const { tip, show, hide } = useTooltip();

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="block w-full h-56">
        <Axis w={w} h={h} pad={pad} />
        <Grid w={w} h={h} pad={pad} />
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={d} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill="white"
            stroke={color}
            strokeWidth="2"
            className="cursor-pointer hover:r-6 transition-all"
            onMouseEnter={(e) => show(e.currentTarget.cx.baseVal.value, e.currentTarget.cy.baseVal.value - 12, `${fmtDate(series[i].date)} • ${series[i].count}`)}
            onMouseLeave={hide}
          />
        ))}
      </svg>
      {tip && (
        <div className="pointer-events-none absolute -translate-x-1/2 rounded-lg border bg-white px-3 py-2 text-sm text-gray-700 shadow-lg z-10" style={{ left: tip.x, top: tip.y }}>
          {tip.label}
        </div>
      )}
    </div>
  );
}

function AreaChart({ series, color = "#10b981" }: { series: { date: string; count: number }[]; color?: string }) {
  if (!series?.length) return <Empty />;
  const w = 560, h = 200, pad = 28;
  const maxY = Math.max(...series.map((s) => s.count), 1);
  const stepX = (w - 2 * pad) / Math.max(1, series.length - 1);
  const pts = series.map((s, i) => ({ x: pad + i * stepX, y: h - pad - (s.count * (h - 2 * pad)) / maxY }));
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
  const area = `M${pad},${h - pad} L ${pts.map((p) => `${p.x},${p.y}`).join(" L ")} L ${w - pad},${h - pad} Z`;
  
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="block w-full h-56">
      <Axis w={w} h={h} pad={pad} />
      <Grid w={w} h={h} pad={pad} />
      <defs>
        <linearGradient id={`area-gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#area-gradient-${color})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BarChart({ series, color = "#f59e0b" }: { series: { label: string; value: number }[]; color?: string }) {
  if (!series?.length) return <Empty />;
  const w = 560, h = 200, pad = 28;
  const max = Math.max(...series.map((s) => s.value), 1);
  const barW = (w - 2 * pad) / series.length - 6;
  
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="block w-full h-56">
      <Axis w={w} h={h} pad={pad} />
      <Grid w={w} h={h} pad={pad} />
      <defs>
        <linearGradient id={`bar-gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {series.map((s, i) => {
        const x = pad + i * ((w - 2 * pad) / series.length);
        const height = ((h - 2 * pad) * s.value) / max;
        return (
          <rect 
            key={i} 
            x={x} 
            y={h - pad - height} 
            width={barW} 
            height={height} 
            fill={`url(#bar-gradient-${color})`} 
            rx={6}
            className="hover:opacity-80 transition-opacity"
          />
        );
      })}
    </svg>
  );
}

function HBarChart({ series, color = "#8b5cf6" }: { series: { label: string; value: number }[]; color?: string }) {
  if (!series?.length) return <Empty />;
  const w = 560, h = Math.max(200, 40 + series.length * 26), pad = 28;
  const max = Math.max(...series.map((s) => s.value), 1);
  const barH = (h - 2 * pad) / series.length - 6;
  
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="block w-full" style={{ height: h }}>
      <Axis w={w} h={h} pad={pad} />
      <Grid w={w} h={h} pad={pad} />
      <defs>
        <linearGradient id={`hbar-gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {series.map((s, i) => {
        const y = pad + i * ((h - 2 * pad) / series.length);
        const width = ((w - 2 * pad) * s.value) / max;
        return (
          <g key={i}>
            <rect x={pad} y={y} width={width} height={barH} fill={`url(#hbar-gradient-${color})`} rx={6} className="hover:opacity-80 transition-opacity" />
            <text 
              x={pad} 
              y={y + barH / 2} 
              dominantBaseline="middle" 
              textAnchor="start" 
              className="fill-gray-700 text-xs font-medium"
            >
              {s.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Donut({ value, total, color = "#22c55e" }: { value: number; total: number; color?: string }) {
  const size = 180;
  const stroke = 20;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? value / total : 0;
  
  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-48 w-48">
        <defs>
          <linearGradient id={`donut-gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#f1f5f9" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#donut-gradient-${color})`}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c}`}
          strokeDashoffset={`${c * (1 - pct)}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-gray-900 text-2xl font-bold">
          {Math.round(pct * 100)}%
        </text>
        <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle" className="fill-gray-500 text-sm">
          {value}/{total}
        </text>
      </svg>
    </div>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <div className="text-4xl mb-2">📊</div>
      <div className="text-sm">Không có dữ liệu</div>
    </div>
  );
}

function Skeleton({ className = "h-24" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 ${className}`} 
         style={{ backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
  );
}

// ===== Main Component =====

export default function AdminHome() {
  const [range, setRange] = useState<RangeKey>("14");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const [kpis, setKpis] = useState({ totalRooms: 0, occupiedRooms: 0, pendingBookings: 0, paymentsToday: 0, revenueToday: 0, tasksTodo: 0 });
  const [bookingsSeries, setBookingsSeries] = useState<{ date: string; count: number }[]>([]);
  const [checkinsSeries, setCheckinsSeries] = useState<{ date: string; count: number }[]>([]);
  const [paymentsSeries, setPaymentsSeries] = useState<{ date: string; sum: number }[]>([]);
  const [servicesTop, setServicesTop] = useState<{ name: string; count: number }[]>([]);
  const [tasksSummary, setTasksSummary] = useState<TasksResp>({ todo: 0, in_progress: 0, done: 0, cancelled: 0 });

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Clean up previous abort controller
    if (abortRef.current) {
      abortRef.current.abort();
    }
    
    const ac = new AbortController();
    abortRef.current = ac;
    const d = Number(range);
    
    // Add a small delay to prevent rapid aborting
    const timeoutId = setTimeout(() => {
      const fetchData = async () => {
        try {
          console.log('Starting dashboard data fetch...');
          
          // Check if already aborted
          if (ac.signal.aborted) {
            console.log('Request was aborted before starting');
            return;
          }
          
        // Add credentials and headers for better compatibility
        const fetchOptions = { 
          signal: ac.signal,
          credentials: 'include' as RequestCredentials,
          headers: {
            'Content-Type': 'application/json',
          }
        };
          
          const [occRes, bRes, cRes, pRes, soRes, tRes] = await Promise.all([
            fetch("/api/dashboard/occupancy", fetchOptions),
            fetch(`/api/dashboard/bookings?days=${d}`, fetchOptions),
            fetch(`/api/dashboard/checkins?days=${d}`, fetchOptions),
            fetch(`/api/dashboard/payments?days=${d}`, fetchOptions),
            fetch("/api/dashboard/service-orders", fetchOptions),
            fetch("/api/dashboard/tasks", fetchOptions),
          ]);

          // Check if aborted during fetch
          if (ac.signal.aborted) {
            console.log('Request was aborted during fetch');
            return;
          }

          console.log('Fetch responses:', { 
            occupancy: occRes.status, 
            bookings: bRes.status, 
            checkins: cRes.status, 
            payments: pRes.status, 
            services: soRes.ok, 
            tasks: tRes.status 
          });

          if (!occRes.ok || !bRes.ok || !cRes.ok || !pRes.ok || !soRes.ok || !tRes.ok) {
            const failed = [
              !occRes.ok && 'occupancy',
              !bRes.ok && 'bookings', 
              !cRes.ok && 'checkins',
              !pRes.ok && 'payments',
              !soRes.ok && 'services',
              !tRes.ok && 'tasks'
            ].filter(Boolean);
            throw new Error(`HTTP error in: ${failed.join(', ')}`);
          }

          const [occ, b, c, p, so, t] = await Promise.all([
            occRes.json() as Promise<OccupancyResp>,
            bRes.json() as Promise<BookingsResp>,
            cRes.json() as Promise<CheckinsResp>,
            pRes.json() as Promise<PaymentsResp>,
            soRes.json() as Promise<ServicesResp>,
            tRes.json() as Promise<TasksResp>,
          ]);

          // Final check before setting state
          if (ac.signal.aborted) {
            console.log('Request was aborted before setting state');
            return;
          }

          console.log('Data loaded successfully:', { occ, b, c, p, so, t });

          setKpis({ 
            totalRooms: occ.total, 
            occupiedRooms: occ.occupied, 
            pendingBookings: b.pending, 
            paymentsToday: p.count, 
            revenueToday: p.sum, 
            tasksTodo: t.todo + t.in_progress 
          });
          setBookingsSeries(b.series);
          setCheckinsSeries(c.series);
          setPaymentsSeries(p.series);
          setServicesTop(so.top);
          setTasksSummary(t);
        } catch (err) {
          // Don't set error if request was aborted
          if (err instanceof Error && err.name === 'AbortError') {
            console.log('Request was aborted');
            return;
          }
          
          console.error('Dashboard fetch error:', err);
          setError(`Không tải được dữ liệu: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
          
        // Fallback to mock data
        console.log('Using fallback mock data...');
        const fallbackData = getDashboardData();
        const fallbackSeries = getTimeSeriesData(Number(range));
        
        setKpis({ 
          totalRooms: fallbackData.occupancy.total, 
          occupiedRooms: fallbackData.occupancy.occupied, 
          pendingBookings: fallbackData.bookings.pending, 
          paymentsToday: fallbackData.payments.count, 
          revenueToday: fallbackData.payments.sum, 
          tasksTodo: fallbackData.tasks.todo + fallbackData.tasks.in_progress 
        });
        setBookingsSeries(fallbackSeries.map(s => ({ date: s.date, count: s.bookings })));
        setCheckinsSeries(fallbackSeries.map(s => ({ date: s.date, count: s.checkins })));
        setPaymentsSeries(fallbackSeries.map(s => ({ date: s.date, sum: s.payments })));
        setServicesTop(fallbackData.services.top);
        setTasksSummary(fallbackData.tasks);
        } finally {
          // Only set loading to false if not aborted
          if (!ac.signal.aborted) {
            setLoading(false);
          }
        }
      };

      fetchData();
    }, 100); // 100ms delay
    
    return () => {
      clearTimeout(timeoutId);
      ac.abort();
    };
  }, [range, refreshTrigger]);

  const occupancyPercent = useMemo(() => Math.round((kpis.occupiedRooms / Math.max(1, kpis.totalRooms)) * 100), [kpis]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Tổng quan hệ thống quản lý khách sạn</p>
          </div>
          <RangeSelector range={range} setRange={setRange} />
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              {error}
            </div>
            <button 
              onClick={() => {
                setError(null);
                setRefreshTrigger(prev => prev + 1);
              }}
              className="ml-4 px-3 py-1 text-xs bg-red-100 hover:bg-red-200 rounded-md transition-colors"
            >
              🔄 Thử lại
            </button>
          </div>
        )}

        {/* KPIs */}
        <section className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {loading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <KPICard 
                title="Tỉ lệ lấp đầy" 
                value={`${kpis.occupiedRooms}/${kpis.totalRooms}`} 
                hint={`${occupancyPercent}% đang ở`}
                icon="🏨"
                color="blue"
                trend={{ value: 12, isPositive: true }}
              />
              <KPICard 
                title="Đặt phòng chờ" 
                value={String(kpis.pendingBookings)} 
                hint="Cần xử lý"
                icon="⏳"
                color="orange"
                trend={{ value: 5, isPositive: false }}
              />
              <KPICard 
                title="Doanh thu hôm nay" 
                value={fmtCurrency(kpis.revenueToday)} 
                hint={`${kpis.paymentsToday} giao dịch`}
                icon="💰"
                color="green"
                trend={{ value: 8, isPositive: true }}
              />
              <KPICard 
                title="Công việc đang chờ" 
                value={String(kpis.tasksTodo)} 
                hint="Cần thực hiện"
                icon="📋"
                color="purple"
                trend={{ value: 3, isPositive: false }}
              />
            </>
          )}
        </section>
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Occupancy Donut */}
          <Card title="Tỉ lệ lấp đầy phòng" className="lg:col-span-1">
            {loading ? <Skeleton className="h-64" /> : (
              <div className="space-y-4">
                <Donut value={kpis.occupiedRooms} total={kpis.totalRooms} color="#3b82f6" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">{kpis.occupiedRooms}</div>
                    <div className="text-blue-600">Phòng đang ở</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-700">{kpis.totalRooms - kpis.occupiedRooms}</div>
                    <div className="text-gray-600">Phòng trống</div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Tasks Stacked */}
          <Card title="Trạng thái công việc">
            {loading ? <Skeleton className="h-64" /> : (
              <div className="space-y-4">
                <Stacked tasks={tasksSummary} />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="text-red-700">Chờ xử lý</span>
                    <span className="font-bold text-red-800">{tasksSummary.todo}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="text-yellow-700">Đang thực hiện</span>
                    <span className="font-bold text-yellow-800">{tasksSummary.in_progress}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-green-700">Hoàn thành</span>
                    <span className="font-bold text-green-800">{tasksSummary.done}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Đã hủy</span>
                    <span className="font-bold text-gray-800">{tasksSummary.cancelled}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Bottom Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title={`Xu hướng đặt phòng (${range} ngày)`}>
            {loading ? <Skeleton className="h-64" /> : (
              <div className="space-y-4">
                <LineChart series={bookingsSeries} color="#3b82f6" />
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-700">{bookingsSeries.reduce((sum, s) => sum + s.count, 0)}</div>
                    <div className="text-blue-600">Tổng đặt phòng</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-700">{Math.round(bookingsSeries.reduce((sum, s) => sum + s.count, 0) / Math.max(1, bookingsSeries.length))}</div>
                    <div className="text-green-600">Trung bình/ngày</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-700">{Math.max(...bookingsSeries.map(s => s.count), 0)}</div>
                    <div className="text-purple-600">Cao nhất/ngày</div>
                  </div>
                </div>
              </div>
            )}
          </Card>
          
          <Card title={`Lượt check-in (${range} ngày)`}>
            {loading ? <Skeleton className="h-64" /> : (
              <div className="space-y-4">
                <AreaChart series={checkinsSeries} color="#10b981" />
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-700">{checkinsSeries.reduce((sum, s) => sum + s.count, 0)}</div>
                    <div className="text-green-600">Tổng check-in</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-lg font-bold text-emerald-700">{Math.round(checkinsSeries.reduce((sum, s) => sum + s.count, 0) / Math.max(1, checkinsSeries.length))}</div>
                    <div className="text-emerald-600">Trung bình/ngày</div>
                  </div>
                  <div className="text-center p-3 bg-teal-50 rounded-lg">
                    <div className="text-lg font-bold text-teal-700">{Math.max(...checkinsSeries.map(s => s.count), 0)}</div>
                    <div className="text-teal-600">Cao nhất/ngày</div>
                  </div>
                </div>
              </div>
            )}
          </Card>
          
          <Card 
            title={`Doanh thu thanh toán (${range} ngày)`} 
            actions={<ExportCSV filename={`payments_${range}d.csv`} rows={paymentsSeries.map((s) => ({ Ngày: fmtDate(s.date), DoanhThu: s.sum }))} />}
          >
            {loading ? <Skeleton className="h-64" /> : (
              <div className="space-y-4">
                <BarChart series={paymentsSeries.map((s) => ({ label: fmtDate(s.date), value: s.sum }))} color="#f59e0b" />
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-bold text-yellow-700">{fmtCurrency(paymentsSeries.reduce((sum, s) => sum + s.sum, 0))}</div>
                    <div className="text-yellow-600">Tổng doanh thu</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-700">{fmtCurrency(Math.round(paymentsSeries.reduce((sum, s) => sum + s.sum, 0) / Math.max(1, paymentsSeries.length)))}</div>
                    <div className="text-orange-600">Trung bình/ngày</div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <div className="text-lg font-bold text-amber-700">{fmtCurrency(Math.max(...paymentsSeries.map(s => s.sum), 0))}</div>
                    <div className="text-amber-600">Cao nhất/ngày</div>
                  </div>
                </div>
              </div>
            )}
          </Card>
          
          <Card 
            title="Top dịch vụ được sử dụng" 
            actions={<ExportCSV filename={`services_top_${range}d.csv`} rows={servicesTop} />}
          >
            {loading ? <Skeleton className="h-64" /> : (
              <div className="space-y-4">
                <HBarChart series={servicesTop.map((s) => ({ label: s.name, value: s.count }))} color="#8b5cf6" />
                <div className="space-y-2">
                  {servicesTop.slice(0, 5).map((service, index) => (
                    <div key={service.name} className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-purple-800">{service.name}</span>
                      </div>
                      <div className="text-sm font-bold text-purple-700">{service.count} lần</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <Card title="Truy cập nhanh">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href="/admin/bookings" className="group flex flex-col items-center p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all">
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📅</div>
              <div className="text-sm font-medium text-gray-900">Đặt phòng</div>
            </Link>
            <Link href="/admin/checkins" className="group flex flex-col items-center p-4 rounded-xl border border-gray-200 bg-white hover:border-green-300 hover:shadow-md transition-all">
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏠</div>
              <div className="text-sm font-medium text-gray-900">Check-in</div>
            </Link>
            <Link href="/admin/payments" className="group flex flex-col items-center p-4 rounded-xl border border-gray-200 bg-white hover:border-yellow-300 hover:shadow-md transition-all">
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">💳</div>
              <div className="text-sm font-medium text-gray-900">Thanh toán</div>
            </Link>
            <Link href="/admin/tasks" className="group flex flex-col items-center p-4 rounded-xl border border-gray-200 bg-white hover:border-purple-300 hover:shadow-md transition-all">
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">✅</div>
              <div className="text-sm font-medium text-gray-900">Công việc</div>
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}

// ===== Extra: Stacked bar kept from your version (with axes) =====
function Stacked({ tasks }: { tasks: TasksResp }) {
  const total = tasks.todo + tasks.in_progress + tasks.done + tasks.cancelled;
  if (!total) return <Empty />;
  const w = 560, h = 200, pad = 28;
  const barH = h - 2 * pad;
  const width = (v: number) => ((w - 2 * pad) * v) / total;
  
  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${w} ${h}`} className="block w-full h-56">
        <Axis w={w} h={h} pad={pad} />
        <rect x={pad} y={pad} width={width(tasks.todo)} height={barH} fill="#ef4444" rx={6} />
        <rect x={pad + width(tasks.todo)} y={pad} width={width(tasks.in_progress)} height={barH} fill="#f59e0b" rx={6} />
        <rect x={pad + width(tasks.todo + tasks.in_progress)} y={pad} width={width(tasks.done)} height={barH} fill="#22c55e" rx={6} />
        <rect x={pad + width(tasks.todo + tasks.in_progress + tasks.done)} y={pad} width={width(tasks.cancelled)} height={barH} fill="#6b7280" rx={6} />
        <text x={w / 2} y={pad + barH / 2} dominantBaseline="middle" textAnchor="middle" className="fill-white text-lg font-bold">
          {total}
        </text>
      </svg>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
          <span>Chờ ({tasks.todo})</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
          <span>Đang làm ({tasks.in_progress})</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span>Hoàn thành ({tasks.done})</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>
          <span>Hủy ({tasks.cancelled})</span>
        </div>
      </div>
    </div>
  );
}

// ===== CSV Export utility =====
function ExportCSV({ filename, rows }: { filename: string; rows: Record<string, string | number>[] }) {
  const download = () => {
    if (!rows?.length) return;
    const headers = Object.keys(rows[0]);
    const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button 
      onClick={download} 
      className="flex items-center gap-2 h-8 rounded-md border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
    >
      Xuất Excel
    </button>
  );
}
