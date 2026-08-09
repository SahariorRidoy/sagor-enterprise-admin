import { NextRequest, NextResponse } from "next/server";

// Mock settings - replace with actual database call
const getSettings = async () => {
  // This should fetch from your actual database
  return {
    deliveryCharge: 60,
    freeDeliveryThreshold: 2000
  };
};

export async function GET(request: NextRequest) {
  try {
    const settings = await getSettings();
    
    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch delivery settings" },
      { status: 500 }
    );
  }
}