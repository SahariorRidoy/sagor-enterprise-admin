"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  CircleDollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { useGetOrderSummaryQuery } from "@/redux/featured/order/orderApi";

export default function OrderCard() {
  const [filter, setFilter] = useState("all");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [params, setParams] = useState<{ startDate?: string; endDate?: string }>({});

  // --- Helper to get date ranges
  const getDateRange = (type: string) => {
    const today = new Date();
    let start: Date, end: Date;

    switch (type) {
      case "all":
        return {};
      case "daily":
        start = end = today;
        break;
      case "weekly":
        start = new Date(today);
        start.setDate(today.getDate() - 7);
        end = today;
        break;
      case "monthly":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = today;
        break;
      case "yearly":
        start = new Date(today.getFullYear(), 0, 1);
        end = today;
        break;
      default:
        return {};
    }

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  };

  // --- Update params whenever filter/custom changes
  useEffect(() => {
    if (filter !== "custom") {
      setParams(getDateRange(filter));
    } else if (customRange.start && customRange.end) {
      setParams({ startDate: customRange.start, endDate: customRange.end });
    }
  }, [filter, customRange]);

  // --- RTK Query hook
  const { data: summary, isLoading, isError, refetch } = useGetOrderSummaryQuery(params);

  // --- Summary cards
  const cards = [
    { label: "Total Orders", value: summary?.totalOrders || 0, icon: <ShoppingBag className="w-5 h-5 text-blue-500" /> },
    { label: "Cancel Orders", value: summary?.canceledOrders || 0, icon: <ShoppingBag className="w-5 h-5 text-red-500" /> },
    { label: "Pending Orders", value: summary?.pendingOrders || 0, icon: <CircleDollarSign className="w-5 h-5 text-orange-500" /> },
    { label: "Paid Orders", value: summary?.paidOrders || 0, icon: <CreditCard className="w-5 h-5 text-green-500" /> },
    { label: "SR Orders", value: summary?.srOrders || 0, icon: <TrendingUp className="w-5 h-5 text-indigo-500" /> },
    { label: "SR Canceled Orders", value: summary?.srCanceledOrders || 0, icon: <TrendingDown className="w-5 h-5 text-indigo-500" /> },
    { label: "Customers Orders", value: summary?.customerOrders || 0, icon: <TrendingUp className="w-5 h-5 text-purple-500" /> },
    { label: "Total Sale Amount", value: `${summary?.totalOrderSaleAmount || 0}৳`, icon: <TrendingUp className="w-5 h-5 text-teal-500" /> },
    { label: "Total Pending Sale", value: `${summary?.totalPendingSale || 0}৳`, icon: <TrendingDown className="w-5 h-5 text-red-500" /> },
    { label: "Total Paid Order Sale", value: `${summary?.totalPaidOrderSaleAmount || 0}৳`, icon: <TrendingUp className="w-5 h-5 text-green-600" /> },
  ];

  return (
    <div>
      {/* --- Filter Buttons --- */}
      <div className="flex flex-wrap gap-2 items-center mb-6">
        {["all", "daily", "weekly", "monthly", "yearly", "custom"].map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} className="capitalize" onClick={() => setFilter(f)}>
            {f}
          </Button>
        ))}

        {/* --- Custom Date Picker --- */}
        {filter === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="border rounded-md p-2"
              value={customRange.start}
              onChange={(e) => setCustomRange((prev) => ({ ...prev, start: e.target.value }))}
            />
            <span>to</span>
            <input
              type="date"
              className="border rounded-md p-2"
              value={customRange.end}
              onChange={(e) => setCustomRange((prev) => ({ ...prev, end: e.target.value }))}
            />
            <Button onClick={() => refetch()} className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Apply
            </Button>
          </div>
        )}
      </div>

      {/* --- Loading / Error --- */}
      {isLoading && <p>Loading summary...</p>}
      {isError && <p className="text-red-500">Failed to load summary</p>}

      {/* --- Summary Cards Grid --- */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-sm font-medium">{item.label}</p>
              {item.icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mt-3">{item.value}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
