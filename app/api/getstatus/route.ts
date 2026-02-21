


import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import { NextRequest,NextResponse } from "next/server";

export async function GET(req: NextRequest) {

  try {
    
  await dbConnect();

  const pendingOrders = await Order.find({ status: { $nin: ["delivered", "cancelled", "DELIVERED"] } });
console.log(pendingOrders);
  for (const order of pendingOrders) {
    const res = await fetch(
      `https://reseller.dakazinabusinessconsult.com/api/v1/fetch-single-transaction`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.DAKAZI_API_KEY   !,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          transaction_id: order.transaction_id
        })
      }
    );

    const data = await res.json();
    console.log("response from dakazi",data);

     if (!data.order_items || !data.order_items.length) {
       console.log("Order items not found");
       continue;
      }
    const status = data.order_items[0].status.toLowerCase();

    if (data.status !== "pending") {
     await Order.findByIdAndUpdate(order._id, {
        status: status
      });
    }
  }

  
  return NextResponse.json({ success: true });
} catch (error: any) {
  console.log("Error updating order statuses: ", error);
  return NextResponse.json({ success: false, error: error });
}

}