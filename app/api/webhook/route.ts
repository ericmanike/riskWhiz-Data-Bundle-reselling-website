import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await dbConnect();

   const rawBody = await request.text();

if (!rawBody) {
  return NextResponse.json(
    { error: "Empty webhook body" },
    { status: 400 }
  );
}

let data;

try {
  data = JSON.parse(rawBody);
} catch (err) {
  return NextResponse.json(
    { error: "Invalid JSON format" },
    { status: 400 }
  );
}

    if (!data) {
      return NextResponse.json({ message: " No webhook response " }, { status: 400 });
    }
    const { transaction_id, status } = data;
    console.log('Received webhook data:', data);

    if (!transaction_id || !status) {
      return NextResponse.json({ error: "Missing transaction_id or status" }, { status: 400 });
    }

    await Order.findOneAndUpdate(
      { transaction_id },
      { status: status.toLowerCase() }
    );

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook error: " + error }, { status: 500 });
  }
}