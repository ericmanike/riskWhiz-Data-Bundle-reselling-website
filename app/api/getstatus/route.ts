
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
export async function GET() {

  try {
    
  await dbConnect();
 const pendingOrders = await Order.find({ status: { $nin: ["delivered", "cancelled", "DELIVERED"] } });
console.log(pendingOrders);
  for (const order of pendingOrders) {
    if (order.transaction_id.startsWith('paid')) {
      continue;
    }
    const res = await fetch(
      `https://reseller.dakazinabusinessconsult.com/api/v1/fetch-single-transaction?transaction_id=${order.transaction_id}`,
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.DAKAZI_API_KEY!,
          "Accept": "application/json"
        },
        body:JSON.stringify({
          transaction_id: `${order.transaction_id}`,
        }),
        redirect: "follow",
      }
    );

    const data = await res.json();
    console.log("response from dakazi for", `${order.transaction_id}: `, data);
    // const status = data.order_items[0].status.toLowerCase();

    // if (data.status !== "pending") {
    //  await Order.findByIdAndUpdate(order._id, {
    //     status: status
    //   });
    //}
  }

  
  return Response.json({ success: true });
} catch (error: any) {
  console.log("Error updating order statuses: ", error);
  return Response.json({ success: false, error: error });
}

}