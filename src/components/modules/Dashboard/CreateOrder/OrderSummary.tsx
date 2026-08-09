import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const OrderSummary = ({
  finalOrder,
  setOrderNote,
  deliveryCharge
}: {
  finalOrder: { totalAmount: number }; // totalAmount type number
  setOrderNote: (note: string) => void;
  deliveryCharge: number;
}) => {
  const totalWithDelivery = finalOrder.totalAmount + deliveryCharge;

  return (
    <Card className="sticky top-0">
      <CardContent>
        <h2 className="text-2xl font-semibold mb-8">Order Summary</h2>

        <div className="flex justify-between text-lg text-[#023337] mb-2">
          <span>Subtotal</span>
          <span>{finalOrder.totalAmount} <span className="text-2xl">৳</span></span>
        </div>

        <div className="flex justify-between text-lg text-[#023337] mb-2">
          <span>Delivery Charge</span>
          <span>{deliveryCharge} <span className="text-2xl">৳</span></span>
        </div>

        <div className="flex justify-between text-lg font-semibold text-[#023337] mb-4 border-t pt-2">
          <span>Total</span>
          <span>{totalWithDelivery} <span className="text-2xl">৳</span></span>
        </div>

        <div>
          <label className="text-sm block mb-1">Order Notes (Optional)</label>
          <Input
            onChange={(e) => setOrderNote(e.target.value)}
            placeholder="Add any special instructions..."
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;

