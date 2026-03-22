import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { status: "error", message: "Reference is required" },
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

    const url = `https://spendless.top/api/orders?reference=${encodeURIComponent(reference)}`;

    const spendlessResponse = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        "Accept": "application/json",
      },
    });

    const data = await spendlessResponse.json();

    return NextResponse.json(data, { status: spendlessResponse.status });
  } catch (error: any) {
    console.error("Spendless Status Error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
