// src/components/sr/OrdersTable.tsx
"use client";

import { useState, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, Eye, Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useGetMyOrdersQuery } from "@/redux/featured/order/orderApi";
import { useGetSettingsQuery } from "@/redux/featured/settings/settingsApi";
import { useReactToPrint } from "react-to-print";

// Format BDT
function formatBDT(n: number) {
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return "৳ " + new Intl.NumberFormat("en-BD").format(n);
  }
}

// Status badge style
function toStatusBadge(status: string) {
  const base = "border font-medium capitalize";
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    processing: "bg-blue-100 text-blue-700 border-blue-200",
    "at-local-facility": "bg-purple-100 text-purple-700 border-purple-200",
    delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-100 text-rose-700 border-rose-200",
    paid: "bg-green-100 text-green-700 border-green-200",
    other: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return `${base} ${map[status] || map.other}`;
}

function OrderModal({
  order,
  isOpen,
  onClose,
  deliveryCharge,
}: {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  deliveryCharge: number;
}) {
  // Hooks MUST be at the top level, before any early return
  const printRef = useRef<HTMLDivElement>(null);
const handlePrint = useReactToPrint({
  contentRef: printRef,
  documentTitle: `Receipt_${order?._id?.slice(-8).toUpperCase() || "Unknown"}`,
  pageStyle: `
    @page {
      size: 80mm auto; /* fixed width, auto height */
      margin: 5mm;
    }
    @media print {
      body {
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center; /* center horizontally */
      }
      #print-content {
        width: 80mm;
        text-align: center; /* center text/content */
      }
    }
  `,
});


  // Early return AFTER hooks
  if (!order) return null;

  const items = order.orderInfo || [];
  const status = order.status || "other";

  return (
    <>
      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Order Details</DialogTitle>
              <Button
                onClick={handlePrint}
                variant="outline"
                size="sm"
                className="ml-auto mr-8"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Receipt
              </Button>
            </div>
            <DialogClose asChild />
          </DialogHeader>

          <div className="space-y-4 px-6 pb-6 text-sm">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Order ID:</span> {order._id}
              </div>
              <div>
                <span className="font-medium">Created At:</span>{" "}
                {new Date(order.createdAt).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Payment Method:</span>{" "}
                <span className="capitalize">{order.paymentInfo}</span>
              </div>
              <div>
                <span className="font-medium">Delivery Charge:</span>{" "}
                {formatBDT(deliveryCharge)}
              </div>
              <div>
                <span className="font-medium">Total Amount:</span>{" "}
                {formatBDT(order.totalAmount)}
              </div>
            </div>

            {/* Customer Info */}
            <div className="border-t pt-3">
              <h4 className="font-semibold mb-2">Customer Info</h4>
              <div>
                <div>
                  <span className="font-medium">Name:</span>{" "}
                  {order.customerInfo.firstName} {order.customerInfo.lastName}
                </div>
                {order.customerInfo.phone && (
                  <div>
                    <span className="font-medium">Phone:</span>{" "}
                    {order.customerInfo.phone}
                  </div>
                )}
                {order.customerInfo.address && (
                  <div className="col-span-2">
                    <span className="font-medium">Address:</span>{" "}
                    {order.customerInfo.address}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="border-t pt-3">
              <h4 className="font-semibold mb-3">Products</h4>

              <div className="space-y-3">
                {items.map((item: any, idx: number) => {
                  const product = item.productInfo || {};
                  const desc = product.description || {};
                  const total = item.totalAmount || {};
                  const commission = item.commission || {};

                  return (
                    <Card key={idx} className="border shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <h5 className="font-semibold text-base">
                                {desc.name}
                              </h5>
                              <Badge className={toStatusBadge(status)}>
                                {status}
                              </Badge>
                            </div>

                            <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="font-medium">Price:</span>{" "}
                                {formatBDT(item.selectedPrice)}
                              </div>
                              <div>
                                <span className="font-medium">Quantity:</span>{" "}
                                {item.quantity || 1}
                              </div>
                              <div>
                                <span className="font-medium">Sub Total:</span>{" "}
                                {formatBDT(total.subTotal)}
                              </div>
                              <div>
                                <span className="font-medium">Total:</span>{" "}
                                {formatBDT(total.total)}
                              </div>
                            </div>

                            {/* Commission - ONLY visible in modal */}
                            {commission && (
                              <div className="mt-2 grid grid-cols-3 gap-2 text-xs border-t pt-2">
                                <div>
                                  <span className="font-medium">Type:</span>{" "}
                                  {commission.type}
                                </div>
                                <div>
                                  <span className="font-medium">Value:</span>{" "}
                                  {commission.value}
                                  {commission.type === "percentage" ? "%" : ""}
                                </div>
                                <div>
                                  <span className="font-medium">Amount:</span>{" "}
                                  {formatBDT(commission.amount)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Order Note */}
            {order.orderNote && (
              <div className="border-t pt-3">
                <h4 className="font-semibold mb-1">Order Note</h4>
                <p>{order.orderNote}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden Print Area */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "12px",
              width: "80mm",
              padding: "10px",
              lineHeight: "1.4",
            }}
          >
            {/* Header */}
            <div
              style={{
                textAlign: "center",
                borderBottom: "2px dashed #000",
                paddingBottom: "10px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                Sagor Enterprise
              </div>
              <div style={{ fontSize: "10px" }}>
                Kanaipur Bazar, Faridpur, Dhaka Division, Bangladesh
              </div>
              <div style={{ fontSize: "10px" }}>Phone: +88001727-175848</div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  margin: "5px 0",
                }}
              >
                *** SALES RECEIPT ***
              </div>
              <div style={{ fontSize: "11px" }}>
                {new Date(order.createdAt).toLocaleString("en-BD", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            </div>

            {/* Order Info */}
            <div style={{ fontSize: "11px", margin: "10px 0" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "3px 0",
                }}
              >
                <span style={{ fontWeight: "bold" }}>Receipt #:</span>
                <span>{order._id.slice(-8).toUpperCase()}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "3px 0",
                }}
              >
                <span style={{ fontWeight: "bold" }}>Customer:</span>
                <span>
                  {order.customerInfo.firstName} {order.customerInfo.lastName}
                </span>
              </div>
              {order.customerInfo.phone && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    margin: "3px 0",
                  }}
                >
                  <span style={{ fontWeight: "bold" }}>Phone:</span>
                  <span>{order.customerInfo.phone}</span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "3px 0",
                }}
              >
                <span style={{ fontWeight: "bold" }}>Payment:</span>
                <span style={{ textTransform: "uppercase" }}>
                  {order.paymentInfo}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "3px 0",
                }}
              >
                <span style={{ fontWeight: "bold" }}>Status:</span>
                <span>
                  <span
                    style={{
                      padding: "2px 8px",
                      border: "1px solid #000",
                      borderRadius: "3px",
                      fontSize: "10px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}
                  >
                    {status}
                  </span>
                </span>
              </div>
            </div>

            <div
              style={{ borderTop: "2px solid #000", margin: "10px 0" }}
            ></div>

            {/* Products */}
            <div style={{ margin: "10px 0" }}>
              <div
                style={{
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: "8px",
                }}
              >
                ITEMS PURCHASED
              </div>
              {items.map((item: any, idx: number) => {
                const desc = item.productInfo?.description || {};
                const total = item.totalAmount || {};
                const qty = item.quantity || 1;
                const price = item.selectedPrice;

                return (
                  <div key={idx} style={{ marginBottom: "10px" }}>
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: "12px",
                        textTransform: "uppercase",
                      }}
                    >
                      {idx + 1}. {desc.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "11px",
                      }}
                    >
                      <span>
                        {formatBDT(price)} x {qty}
                      </span>
                      <span style={{ fontWeight: "bold" }}>
                        {formatBDT(total.total)}
                      </span>
                    </div>
                    {total.subTotal !== total.total && (
                      <div style={{ fontSize: "11px", color: "#333" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span> Subtotal:</span>
                          <span>{formatBDT(total.subTotal)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div style={{ borderTop: "2px solid #000", paddingTop: "8px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  margin: "5px 0",
                }}
              >
                <span>SUBTOTAL:</span>
                <span>
                  {formatBDT(
                    items.reduce(
                      (s: number, i: any) => s + (i.totalAmount?.subTotal || 0),
                      0
                    )
                  )}
                </span>
              </div>
              {items.some(
                (i: any) => i.totalAmount?.subTotal !== i.totalAmount?.total
              ) && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    margin: "5px 0",
                  }}
                >
                  <span>ADDITIONAL CHARGES:</span>
                  <span>
                    {formatBDT(
                      order.totalAmount -
                        items.reduce(
                          (s: number, i: any) =>
                            s + (i.totalAmount?.subTotal || 0),
                          0
                        ) -
                        deliveryCharge
                    )}
                  </span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  margin: "5px 0",
                }}
              >
                <span>DELIVERY CHARGE:</span>
                <span>{formatBDT(deliveryCharge)}</span>
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  borderTop: "2px solid #000",
                  borderBottom: "2px solid #000",
                  padding: "8px 0",
                  margin: "8px 0",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>TOTAL AMOUNT:</span>
                  <span>{formatBDT(order.totalAmount + deliveryCharge)}</span>
                </div>
              </div>
            </div>

            {order.orderNote && (
              <>
                <div
                  style={{ borderTop: "1px dashed #000", margin: "8px 0" }}
                ></div>
                <div style={{ fontSize: "11px", margin: "10px 0" }}>
                  <div style={{ fontWeight: "bold" }}>Note:</div>
                  <div>{order.orderNote}</div>
                </div>
              </>
            )}

            {/* Footer */}
            <div
              style={{
                textAlign: "center",
                marginTop: "15px",
                paddingTop: "10px",
                borderTop: "2px dashed #000",
                fontSize: "11px",
              }}
            >
              <div style={{ letterSpacing: "2px", fontSize: "10px" }}>
                *{order._id.slice(-12).toUpperCase()}*
              </div>
              <div
                style={{
                  fontWeight: "bold",
                  marginTop: "10px",
                  fontSize: "12px",
                }}
              >
                THANK YOU!
              </div>
              <div>For any queries, please contact us</div>
              <div>Keep this receipt for future reference</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default function OrdersTable() {
  const userId = useSelector((state: any) => state.auth.user._id);
  const { data: orders = [], isLoading } = useGetMyOrdersQuery(userId);
  const { data: settingsData } = useGetSettingsQuery();
  const deliveryCharge = settingsData?.deliveryCharge || 0;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("DATE_DESC");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (query.trim()) {
      const lower = query.toLowerCase();
      result = result.filter((o) => {
        const fullName = `${o.customerInfo?.firstName ?? ""} ${
          o.customerInfo?.lastName ?? ""
        }`.toLowerCase();
        return (
          o._id.toLowerCase().includes(lower) ||
          fullName.includes(lower) ||
          o.customerInfo?.phone?.includes(lower)
        );
      });
    }

    if (status !== "ALL") {
      // 4. ✅ FIXED: Filter by o.status at the root
      result = result.filter(
        (o) => o.status?.toLowerCase() === status.toLowerCase()
      );
    }

    result.sort((a, b) => {
      switch (sort) {
        case "DATE_ASC":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "DATE_DESC":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "TOTAL_ASC":
          return a.totalAmount - b.totalAmount;
        case "TOTAL_DESC":
          return b.totalAmount - a.totalAmount;
        default:
          return 0;
      }
    });

    return result;
  }, [orders, query, status, sort]);

  // 5. ✅ DELETED the 'orderStatuses' variable
  // const orderStatuses = orders.map((o) => o.status);

  if (isLoading) return <div>Loading orders...</div>;

  const handleView = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* ✅ Controls */}
      <Card className="border shadow-sm">
        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by order id, customer name, phone…"
              className="w-full"
            />
          </div>

          <div>
            <Select value={status} onValueChange={(v) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="at-local-facility">
                  At Local Facility
                </SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={sort} onValueChange={(v) => setSort(v)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="size-4" />
                  <SelectValue placeholder="Sort" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DATE_DESC">Date ↓ (new first)</SelectItem>
                <SelectItem value="DATE_ASC">Date ↑ (old first)</SelectItem>
                <SelectItem value="TOTAL_DESC">Total ↓ (high first)</SelectItem>
                <SelectItem value="TOTAL_ASC">Total ↑ (low first)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* 🖥️ Desktop Table View */}
      <Card className="border shadow-sm hidden md:block">
        <CardContent className="pt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length ? (
                filteredOrders.map((order) => {
                  const name = `${order.customerInfo.firstName ?? ""} ${
                    order.customerInfo.lastName ?? ""
                  }`.trim();
                  return (
                    <TableRow key={order._id} className="hover:bg-muted/40">
                      <TableCell className="font-medium">{order._id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{name || "-"}</span>
                          {order.customerInfo.phone && (
                            <span className="text-xs text-muted-foreground">
                              {order.customerInfo.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {/* ✅ FIX: Add a fallback value for undefined status */}
                        <Badge
                          className={toStatusBadge(order.status || "other")}
                        >
                          {order.status || "other"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatBDT(order.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleView(order)}
                        >
                          <Eye className="size-4" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-sm text-muted-foreground py-10"
                  >
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 📱 Mobile Card View */}
      {/* ✅ Mobile View - Cards */}
      <div className="block md:hidden space-y-4">
        {filteredOrders.map((order) => {
          const name =
            `${order.customerInfo.firstName} ${order.customerInfo.lastName}`.trim();
          // 7. ✅ FIXED: Get status from order.status
          const status = order.status || "other";

          return (
            <Card key={order._id} className="border shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-base">
                    {name || "Unknown"}
                  </h3>
                  <Badge className={toStatusBadge(status)}>{status}</Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Order ID:</span> {order._id}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Phone:</span>{" "}
                  {order.customerInfo.phone || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>

                <div className="flex justify-between items-center mt-3">
                  <p className="font-semibold text-green-700">
                    {formatBDT(order.totalAmount)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleView(order)}
                  >
                    <Eye className="size-4" /> View
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredOrders.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">
            No orders found.
          </p>
        )}
      </div>

      {/* 🧾 Modal */}
      <OrderModal
        order={selectedOrder}
        isOpen={isModalOpen}
        deliveryCharge={deliveryCharge}
        // 8. ✅ REMOVED the 'orderStatus' prop
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
