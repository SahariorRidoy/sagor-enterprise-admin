import { NextRequest, NextResponse } from "next/server";

// Mock settings - replace with actual database call
const getSettings = async () => {
  return {
    deliveryCharge: 60,
    freeDeliveryThreshold: 2000
  };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderAmount = parseFloat(searchParams.get("orderAmount") || "0");

    if (orderAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid order amount" },
        { status: 400 }
      );
    }

    const settings = await getSettings();
    const { deliveryCharge, freeDeliveryThreshold } = settings;

    const isFreeDelivery = orderAmount >= freeDeliveryThreshold;
    const finalDeliveryCharge = isFreeDelivery ? 0 : deliveryCharge;

    return NextResponse.json({
      success: true,
      data: {
        orderAmount,
        deliveryCharge: finalDeliveryCharge,
        isFreeDelivery,
        threshold: freeDeliveryThreshold
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to calculate delivery charge" },
      { status: 500 }
    );
  }
}