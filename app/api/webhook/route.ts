import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const data = await request.json();

    const { reference, status } = data;
    console.log('Received webhook data:', data);

    // if (!transaction_id || !status) {
    //   return NextResponse.json({ error: "Missing transaction_id or status" }, { status: 400 });
    // }


    const order = await Order.findOneAndUpdate(
      { transaction_id: reference,  },
      { status: status.toLowerCase() }
    );
      console.log('order found', order)
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}


/*
Received webhook data: {
  type: 'order_item',
  status: 'PROCESSING',
  previous_status: 'PLACED',
  user_id: 442,
  occurred_at: '2026-03-11T14:01:30+00:00',
  id: 408715,
  order_code: 'ORDER-209081',
  reference: '44217732375380990543442518',
  amount: 4,
  metadata: {
    package_id: 1,
    beneficiary_number: '0543442518',
    api_status: null,
    payment_status: 'success'
  }
}















*/