import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {

     const data = await request.json();
    console.log("Data received from webhook : ", data)
  try { 
    await dbConnect();
 
    const data = await request.json();
    console.log("Data received from webhook : ", data)
    const { reference, status } = data;
    
    console.log('Reference:', reference);
    console.log('Status:', status);

    if (!reference || !status) {
      return NextResponse.json({ error: "Missing transaction_id or status" }, { status: 400 });
    }


    const order = await Order.findOneAndUpdate(
      { transaction_id: reference },
      { status: status.toLowerCase() }
    );
  
    if(!order){
      await Order.findOneAndUpdate(
        { transaction_id: "S"+reference },
        { status: status.toLowerCase() }
      );
    }
 

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







{
    "id": 7988,
    "type": "test_event",
    "status": "DELIVERED",
    "previous_status": "PROCESSING",
    "order_code": "DKZ-TEST-RQ5WKR",
    "reference": "REF-HETWWVUOTM",
    "amount": 10,
    "user_id": 4,
    "occurred_at": "2026-04-10T21:15:44+00:00",
    "test": true,
    "metadata": {
        "message": "This is a test webhook from Dakazina"
    }
}







*/