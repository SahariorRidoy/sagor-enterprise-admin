/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useRef } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { useReactToPrint } from "react-to-print";
import { CircleChevronUp, CircleChevronDown, Search, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  useGetAllOrdersQuery,
  useGetOrderStatusCountsQuery,
  useUpdateOrderStatusMutation,
} from "@/redux/featured/order/orderApi";

type OrderStatus =
  | "pending"
  | "processing"
  | "at-local-facility"
  | "delivered"
  | "cancelled"
  | "paid";

type Order = {
  order_id: string;
  created: string;
  createdAt: string;
  customer: string;
  total: number;
  status: OrderStatus;
  userType: "sr" | "customer";
};

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "at-local-facility",
  "delivered",
  "cancelled",
  "paid",
];

const OrderPage = () => {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OrderStatus>("pending");
  const [searchValue, setSearchValue] = useState("");
  const [sortType] = useState<"customer" | "sr">("customer");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{ orderId: string; newStatus: OrderStatus } | null>(null);
  const itemsPerPage = 10;

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  // Fetch orders with pagination and filters
  const { data: orderResponse, isLoading, refetch } = useGetAllOrdersQuery({
    page: currentPage,
    limit: itemsPerPage,
    status: activeTab,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    searchTerm: searchValue || undefined,
  });

  // Fetch status counts from whole dataset
  const { data: statusCounts = {}, refetch: refetchCounts } = useGetOrderStatusCountsQuery({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  const orders = orderResponse?.data || [];
  const meta = orderResponse?.meta || { total: 0, page: 1, limit: 10, totalPage: 1 };

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      await updateOrderStatus({ id: orderId, status: newStatus }).unwrap();
      toast.success(`Order status updated to ${newStatus.replace("-", " ")}!`);
      refetch();
      refetchCounts();
      setExpandedOrder(null);
      setConfirmModal(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status!");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchValue, startDate, endDate]);

  return (
    <>
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pt-6">
        {/* Search */}
        <div className="relative w-full sm:w-1/3 bg-white">
          <input
            type="text"
            placeholder="Search by order id"
            className="w-full rounded-md px-4 py-2 text-sm"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <Search
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
          />
        </div>

        {/* Filter by Date */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-md shadow-sm">
            <span className="text-sm text-gray-500">Filter by date:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as OrderStatus)}
      >
        <Tabs.List className="flex overflow-x-auto">
          {ORDER_STATUSES.map((status) => (
            <Tabs.Trigger
              key={status}
              value={status}
              className="flex-1 h-[45px] px-4 bg-white text-sm text-center hover:text-violet11 data-[state=active]:text-violet11 data-[state=active]:border-b-2 data-[state=active]:border-violet-500 capitalize"
            >
              {status.replace("-", " ")} ({statusCounts[status] || 0})
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {ORDER_STATUSES.map((status) => (
          <Tabs.Content
            key={status}
            value={status}
            className="grow bg-white p-5 rounded-b-md"
          >
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table className="min-w-[678px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead></TableHead>
                        <TableHead className="text-gray-400">ORDER ID</TableHead>
                        <TableHead className="text-gray-400">CREATED</TableHead>
                        <TableHead className="text-gray-400">CUSTOMER</TableHead>
                        <TableHead className="text-gray-400">TOTAL</TableHead>
                        <TableHead className="text-gray-400">STATUS</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((item: any) => (
                        <TableRow key={item._id}>
                          <TableCell className="text-center">
                            <button
                              className="rounded-full border p-1 text-gray-500"
                              onClick={() =>
                                setExpandedOrder(
                                  expandedOrder === item._id
                                    ? null
                                    : item._id
                                )
                              }
                            >
                              {expandedOrder === item._id ? (
                                <CircleChevronUp />
                              ) : (
                                <CircleChevronDown />
                              )}
                            </button>
                          </TableCell>
                          <TableCell className="font-medium">
                            {item._id}
                          </TableCell>
                          <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                          <TableCell>{`${item.customerInfo.firstName} ${item.customerInfo.lastName}`.trim()}</TableCell>
                          <TableCell>৳{item.totalAmount}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-md capitalize border transition-all ${
                                    item.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
                                      : item.status === "processing"
                                      ? "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200"
                                      : item.status === "at-local-facility"
                                      ? "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200"
                                      : item.status === "delivered"
                                      ? "bg-cyan-100 text-cyan-800 border-cyan-300 hover:bg-cyan-200"
                                      : item.status === "paid"
                                      ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                                      : "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
                                  }`}
                                >
                                  {item.status.replace("-", " ")}
                                  <ChevronDown size={14} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {ORDER_STATUSES.map((statusOption) => (
                                  <DropdownMenuItem
                                    key={statusOption}
                                    className="capitalize"
                                    onSelect={() =>
                                      setConfirmModal({ orderId: item._id, newStatus: statusOption })
                                    }
                                  >
                                    {statusOption.replace("-", " ")}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {meta.totalPage > 0 && (
                  <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Prev
                    </button>

                    {(() => {
                      const pages = [];
                      const maxButtons = 5;
                      let start = Math.max(
                        1,
                        currentPage - Math.floor(maxButtons / 2)
                      );
                      const end = Math.min(meta.totalPage, start + maxButtons - 1);

                      if (end - start < maxButtons - 1) {
                        start = Math.max(1, end - maxButtons + 1);
                      }

                      if (start > 1) {
                        pages.push(1);
                        if (start > 2) pages.push("...");
                      }

                      for (let i = start; i <= end; i++) {
                        pages.push(i);
                      }

                      if (end < meta.totalPage) {
                        if (end < meta.totalPage - 1) pages.push("...");
                        pages.push(meta.totalPage);
                      }

                      return pages.map((num, idx) =>
                        num === "..." ? (
                          <span key={idx} className="px-2">
                            ...
                          </span>
                        ) : (
                          <button
                            key={num}
                            onClick={() => setCurrentPage(num as number)}
                            className={`px-3 py-1 border rounded ${
                              num === currentPage
                                ? "bg-violet-500 text-white border-violet-500"
                                : "bg-white"
                            }`}
                          >
                            {num}
                          </button>
                        )
                      );
                    })()}

                    <button
                      disabled={currentPage === meta.totalPage}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </Tabs.Content>
        ))}
      </Tabs.Root>

      {/* Expanded Order Modal */}
      {expandedOrder && (
        <div className="bg-[#00000085] fixed top-0 left-0 w-[100vw] h-[100vh] flex items-center justify-center z-50">
          <div className="relative bg-white p-6 rounded-xl shadow-2xl w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex gap-2 absolute top-2 right-2 no-print">
              <button
                className="border p-2 border-blue-500"
                onClick={reactToPrintFn}
              >
                Print
              </button>
              <button
                onClick={() => setExpandedOrder(null)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            {(() => {
              const rawOrder = orders.find(
                (o: any) => o._id === expandedOrder
              );
              if (!rawOrder) return <p>Order not found.</p>;

              return (
                <div ref={contentRef} className="space-y-6 px-4">
                  {/* Header */}
                  <div className="pb-4 text-center">
                    <h1 className="text-3xl font-bold uppercase mb-2">
                      ORDER MEMO
                    </h1>
                    <p className="text-sm text-gray-600">
                      Order #{rawOrder._id}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(rawOrder.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Order By info from root */}
                  <div className="flex flex-col gap-1 font-medium">
                    <p className="text-sm text-gray-600 capitalize">
                      Order By : {rawOrder.userRole || "Unknown"}
                    </p>
                  { (rawOrder.orderBy?.name ) &&
                      <p className="text-sm text-gray-600">
                      Name : {rawOrder.orderBy?.name || "Unknown"}
                    </p>
                  }
                  { (rawOrder.orderBy?._id) && <p className="text-sm text-gray-600">
                      Id: {rawOrder.orderBy?._id || "Unknown"}
                    </p>}
                  </div>

                  {/* Customer Info + Payment */}
                  <div className="flex flex-col sm:flex-row justify-between gap-6">
                    <div className="border border-gray-300 sm:w-2/3 p-4 rounded">
                      <h3 className="font-bold mb-3 uppercase text-sm border-b pb-2">
                        Customer Information
                      </h3>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-semibold">Name:</span>{" "}
                          {rawOrder.customerInfo.firstName}{" "}
                          {rawOrder.customerInfo.lastName}
                        </p>
                        <p>
                          <span className="font-semibold">Phone:</span>{" "}
                          {rawOrder.customerInfo.phone}
                        </p>
                        <p>
                          <span className="font-semibold">Address:</span>{" "}
                          {rawOrder.customerInfo.address}
                        </p>
                      </div>
                    </div>

                    <div className="border border-gray-300 sm:w-1/3 p-4 rounded">
                      <h3 className="font-bold mb-3 uppercase text-sm border-b pb-2">
                        Payment
                      </h3>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-semibold">Method:</span>{" "}
                          {rawOrder.paymentInfo}
                        </p>
                        <p>
                          <span className="font-semibold">Total:</span> ৳
                          {rawOrder.totalAmount}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border border-gray-300 p-4 rounded">
                    <h3 className="font-bold mb-3 uppercase text-sm border-b pb-2">
                      Order Items
                    </h3>
                    <div className="overflow-x-auto">
                      <Table className="min-w-[600px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-bold">Product</TableHead>
                            <TableHead className="font-bold">
                              Tracking
                            </TableHead>
                            <TableHead className="font-bold">Price</TableHead>
                            <TableHead className="font-bold">
                              Quantity
                            </TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                            <TableHead className="font-bold">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rawOrder?.orderInfo.map((item: any, idx: number) => (
                            <TableRow key={idx}>
                              <TableCell>
                                {item?.productInfo?.description?.name}
                              </TableCell>
                              <TableCell>{rawOrder.trackingNumber}</TableCell>
                              <TableCell className="text-right">
                                {item.selectedPrice}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="capitalize">
                                {rawOrder?.status || ""}
                              </TableCell>
                              <TableCell className="text-right">
                                ৳{item.totalAmount.total}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="bg-[#00000085] fixed top-0 left-0 w-[100vw] h-[100vh] flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Status Change</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to change the order status to <span className="font-semibold capitalize">{confirmModal.newStatus.replace("-", " ")}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange(confirmModal.orderId, confirmModal.newStatus)}
                className="px-4 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderPage;
