import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      message: "Deprecated endpoint. Please use /api/sepay/webhook",
      redirectTo: "/api/sepay/webhook",
    },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: "Deprecated endpoint. Please use /api/sepay/webhook",
      redirectTo: "/api/sepay/webhook",
    },
    { status: 410 }
  );
}
