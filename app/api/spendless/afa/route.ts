import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, phone, ghana_card, location } = body;

    // Basic validation
    if (!full_name || !phone || !ghana_card || !location) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields: full_name, phone, ghana_card, location" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SPENDLESS_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { status: "error", message: "Spendless API key not configured" },
        { status: 500 }
      );
    }

    const spendlessResponse = await fetch("https://spendless.top/api/afa", {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name,
        phone,
        ghana_card,
        location,
      }),
    });

    const data = await spendlessResponse.json();

    return NextResponse.json(data, { status: spendlessResponse.status });
  } catch (error: any) {
    console.error("Spendless AFA Error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
