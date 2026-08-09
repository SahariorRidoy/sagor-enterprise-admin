"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  ShoppingBag, TrendingDown, Users, Store,
  CircleDollarSign, CreditCard, PackageX, Clock, CheckCircle2,
  ArrowUpRight, ArrowDownRight, Wallet, RefreshCw, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetOrderSummaryQuery } from "@/redux/featured/order/orderApi";
import { useGetAllUsersQuery } from "@/redux/featured/user/userApi";
import { useGetAllVendorsQuery } from "@/redux/featured/allVendors/allvendorsApi";
import { useGetWithdrawalsQuery } from "@/redux/featured/withdrawals/withdrawalsApi";
import { useProductInventoryQuery } from "@/redux/featured/products/productsApi";

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

const getDateRange = (type: string) => {
  const today = new Date();
  if (type === "all") return {};
  let start: Date; const end: Date = today;
  switch (type) {
    case "daily": start = today; break;
    case "weekly": start = new Date(today); start.setDate(today.getDate() - 7); break;
    case "monthly": start = new Date(today.getFullYear(), today.getMonth(), 1); break;
    case "yearly": start = new Date(today.getFullYear(), 0, 1); break;
    default: return {};
  }
  return { startDate: start.toISOString().split("T")[0], endDate: end.toISOString().split("T")[0] };
};

// ─── mock weekly revenue trend (replace with real API when available) ────────
const buildRevenueTrend = (total: number) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weights = [0.10, 0.12, 0.14, 0.13, 0.16, 0.18, 0.17];
  return days.map((day, i) => ({ day, revenue: Math.round(total * weights[i]) }));
};

// ─── colours ────────────────────────────────────────────────────────────────
const GREEN = ["#16a34a", "#22c55e", "#4ade80", "#86efac", "#bbf7d0"];
const STATUS_COLORS: Record<string, string> = {
  Paid: "#16a34a", Pending: "#f59e0b", Cancelled: "#ef4444",
};

// ─── StatCard ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; color: string; trend?: "up" | "down" | null;
}
const StatCard = ({ label, value, sub, icon, color, trend }: StatCardProps) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 shadow-sm border border-green-100 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}>
    <div className={`absolute inset-0 opacity-5 ${color}`} />
    <div className="flex items-start justify-between">
      <div className={`p-2.5 rounded-xl ${color} bg-opacity-10`}>{icon}</div>
      {trend && (
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend === "up" ? "text-green-600" : "text-red-500"}`}>
          {trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {trend === "up" ? "+12%" : "-3%"}
        </span>
      )}
    </div>
    <p className="mt-4 text-2xl font-bold text-gray-800">{value}</p>
    <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

// ─── main ────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [filter, setFilter] = useState("all");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [params, setParams] = useState<{ startDate?: string; endDate?: string }>({});

  useEffect(() => {
    if (filter !== "custom") setParams(getDateRange(filter));
    else if (customRange.start && customRange.end)
      setParams({ startDate: customRange.start, endDate: customRange.end });
  }, [filter, customRange]);

  const { data: summary, isLoading: ordersLoading, refetch } = useGetOrderSummaryQuery(params);
  const { data: users } = useGetAllUsersQuery({});
  const { data: vendors } = useGetAllVendorsQuery();
  const { data: withdrawals } = useGetWithdrawalsQuery();
  const { data: inventory } = useProductInventoryQuery({});

  const totalRevenue = summary?.totalOrderSaleAmount ?? 0;
  const revenueTrend = buildRevenueTrend(totalRevenue);

  const orderStatusData = [
    { name: "Paid", value: summary?.paidOrders ?? 0 },
    { name: "Pending", value: summary?.pendingOrders ?? 0 },
    { name: "Cancelled", value: summary?.canceledOrders ?? 0 },
  ].filter(d => d.value > 0);

  const pendingWithdrawals = withdrawals?.data?.filter((w) => w.status === "pending").length ?? 0;
  const approvedWithdrawals = withdrawals?.data?.filter((w) => w.status === "approved").length ?? 0;

  const statCards: StatCardProps[] = [
    { label: "Total Orders", value: fmt(summary?.totalOrders ?? 0), sub: "All time", icon: <ShoppingBag className="w-5 h-5 text-green-600" />, color: "bg-green-500", trend: "up" },
    { label: "Total Revenue", value: `৳${fmt(totalRevenue)}`, sub: "Sale amount", icon: <CircleDollarSign className="w-5 h-5 text-emerald-600" />, color: "bg-emerald-500", trend: "up" },
    { label: "Paid Orders", value: fmt(summary?.paidOrders ?? 0), sub: "Completed", icon: <CheckCircle2 className="w-5 h-5 text-teal-600" />, color: "bg-teal-500", trend: "up" },
    { label: "Pending Orders", value: fmt(summary?.pendingOrders ?? 0), sub: "Awaiting", icon: <Clock className="w-5 h-5 text-amber-500" />, color: "bg-amber-400", trend: null },
    { label: "Cancelled Orders", value: fmt(summary?.canceledOrders ?? 0), sub: "Lost revenue", icon: <PackageX className="w-5 h-5 text-red-500" />, color: "bg-red-400", trend: "down" },
    { label: "Pending Sale", value: `৳${fmt(summary?.totalPendingSale ?? 0)}`, sub: "Unpaid", icon: <TrendingDown className="w-5 h-5 text-orange-500" />, color: "bg-orange-400", trend: null },
    { label: "Total Users", value: fmt(users?.length ?? 0), sub: "Registered", icon: <Users className="w-5 h-5 text-blue-500" />, color: "bg-blue-400", trend: "up" },
    { label: "Total Vendors", value: fmt(vendors?.length ?? 0), sub: "Active shops", icon: <Store className="w-5 h-5 text-purple-500" />, color: "bg-purple-400", trend: "up" },
    { label: "Total Products", value: fmt(inventory?.totalProducts ?? 0), sub: "In catalogue", icon: <Package className="w-5 h-5 text-green-700" />, color: "bg-green-600", trend: "up" },
    { label: "Pending Withdrawals", value: pendingWithdrawals, sub: "Needs approval", icon: <Wallet className="w-5 h-5 text-rose-500" />, color: "bg-rose-400", trend: null },
    { label: "Approved Withdrawals", value: approvedWithdrawals, sub: "Processed", icon: <CreditCard className="w-5 h-5 text-green-600" />, color: "bg-green-500", trend: "up" },
    { label: "Customer Orders", value: fmt(summary?.customerOrders ?? 0), sub: "Direct orders", icon: <ShoppingBag className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-400", trend: "up" },
  ];

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, Admin 👋</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {["all", "daily", "weekly", "monthly", "yearly", "custom"].map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"}
              className={`capitalize text-xs ${filter === f ? "bg-green-600 hover:bg-green-700 border-green-600" : "border-green-200 text-green-700 hover:bg-green-50"}`}
              onClick={() => setFilter(f)}>
              {f}
            </Button>
          ))}
          {filter === "custom" && (
            <>
              <input type="date" className="border border-green-200 rounded-lg p-1.5 text-xs"
                value={customRange.start} onChange={e => setCustomRange(p => ({ ...p, start: e.target.value }))} />
              <span className="text-gray-400 text-xs">to</span>
              <input type="date" className="border border-green-200 rounded-lg p-1.5 text-xs"
                value={customRange.end} onChange={e => setCustomRange(p => ({ ...p, end: e.target.value }))} />
              <Button size="sm" onClick={() => refetch()} className="bg-green-600 hover:bg-green-700 text-xs gap-1">
                <RefreshCw className="w-3 h-3" /> Apply
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      {ordersLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {statCards.map((c, i) => <StatCard key={i} {...c} />)}
        </div>
      )}

      {/* ── Charts Row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-green-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-800">Weekly Revenue Trend</h2>
              <p className="text-xs text-gray-400">Based on total sale amount</p>
            </div>
            <span className="text-xs bg-green-50 text-green-700 font-semibold px-3 py-1 rounded-full border border-green-200">
              ৳{fmt(totalRevenue)} total
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `৳${fmt(v)}`} />
              <Tooltip formatter={(v: number) => [`৳${v.toLocaleString()}`, "Revenue"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #dcfce7", fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2.5}
                fill="url(#revGrad)" dot={{ fill: "#16a34a", r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Donut */}
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-1">Order Status</h2>
          <p className="text-xs text-gray-400 mb-4">Distribution breakdown</p>
          {orderStatusData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  paddingAngle={4} dataKey="value">
                  {orderStatusData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] ?? GREEN[i % GREEN.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number, name: string) => [v, name]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #dcfce7", fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-2 space-y-1.5">
            {orderStatusData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: STATUS_COLORS[d.name] ?? GREEN[i] }} />
                  <span className="text-gray-600">{d.name}</span>
                </span>
                <span className="font-semibold text-gray-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Order Breakdown Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-1">Order Breakdown</h2>
          <p className="text-xs text-gray-400 mb-4">Paid vs Pending vs Cancelled</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { name: "Paid", value: summary?.paidOrders ?? 0, fill: "#16a34a" },
              { name: "Pending", value: summary?.pendingOrders ?? 0, fill: "#f59e0b" },
              { name: "Cancelled", value: summary?.canceledOrders ?? 0, fill: "#ef4444" },
            ]} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #dcfce7", fontSize: 12 }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {["#16a34a", "#f59e0b", "#ef4444"].map((fill, i) => <Cell key={i} fill={fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Metrics */}
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-1">Quick Metrics</h2>
          <p className="text-xs text-gray-400 mb-4">Key performance indicators</p>
          <div className="space-y-3">
            {[
              { label: "Paid Order Revenue", value: `৳${(summary?.totalPaidOrderSaleAmount ?? 0).toLocaleString()}`, pct: 100, color: "bg-green-500" },
              { label: "Pending Sale Amount", value: `৳${(summary?.totalPendingSale ?? 0).toLocaleString()}`, pct: totalRevenue ? Math.round(((summary?.totalPendingSale ?? 0) / totalRevenue) * 100) : 0, color: "bg-amber-400" },
              { label: "Cancelled Orders", value: summary?.canceledOrders ?? 0, pct: (summary?.totalOrders ?? 0) > 0 ? Math.round(((summary?.canceledOrders ?? 0) / (summary?.totalOrders ?? 1)) * 100) : 0, color: "bg-red-400" },
              { label: "Total Products", value: inventory?.totalProducts ?? 0, pct: 100, color: "bg-teal-500" },
              { label: "Low Stock Items", value: inventory?.lowStockItems ?? 0, pct: (inventory?.totalProducts ?? 0) > 0 ? Math.round(((inventory?.lowStockItems ?? 0) / (inventory?.totalProducts ?? 1)) * 100) : 0, color: "bg-orange-400" },
            ].map((m, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{m.label}</span>
                  <span className="font-semibold text-gray-800">{m.value}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${m.color} transition-all duration-700`} style={{ width: `${Math.min(m.pct, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Summary Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Out of Stock", value: inventory?.outOfStock ?? 0, icon: <PackageX className="w-4 h-4 text-red-500" />, bg: "bg-red-50 border-red-100" },
          { label: "Active Vendors", value: vendors?.filter((v: { status: string }) => v.status === "active").length ?? vendors?.length ?? 0, icon: <Store className="w-4 h-4 text-green-600" />, bg: "bg-green-50 border-green-100" },
          { label: "Total Withdrawals", value: withdrawals?.data?.length ?? 0, icon: <Wallet className="w-4 h-4 text-purple-500" />, bg: "bg-purple-50 border-purple-100" },
          { label: "Paid Revenue", value: `৳${fmt(summary?.totalPaidOrderSaleAmount ?? 0)}`, icon: <CreditCard className="w-4 h-4 text-emerald-600" />, bg: "bg-emerald-50 border-emerald-100" },
        ].map((item, i) => (
          <div key={i} className={`rounded-2xl border p-4 flex items-center gap-3 ${item.bg}`}>
            <div className="p-2 bg-white rounded-xl shadow-sm">{item.icon}</div>
            <div>
              <p className="text-lg font-bold text-gray-800">{item.value}</p>
              <p className="text-xs text-gray-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AdminDashboard;
