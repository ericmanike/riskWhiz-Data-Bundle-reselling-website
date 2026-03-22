import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { networkKey, recipient, capacity } = body;

    // Basic validation
    if (!networkKey || !recipient || capacity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: networkKey, recipient, capacity" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SPENDLESS_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "Spendless API key not configured" },
        { status: 500 }
      );
    }

    const spendlessResponse = await fetch("https://spendless.top/api/purchase", {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        networkKey,
        recipient,
        capacity,
      }),
    });

    const data = await spendlessResponse.json();

    return NextResponse.json(data, { status: spendlessResponse.status });
  } catch (error: any) {
    console.error("Spendless Purchase Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
