// import Order from "@/models/Order";
// import { NextRequest, NextResponse } from "next/server";


// export async function GET(req: NextRequest) {
 
//     const transaction_id = req.nextUrl.searchParams.get("transaction_id");

//     if(!transaction_id){
//         return NextResponse.json({ message: "Transaction ID is required" }, { status: 400 });
//     }   

//     try {
//         const dakaziApiKey = process.env.DAKAZI_API_KEY;
//         if (!dakaziApiKey) {
//             console.log('API key not found');
//             return NextResponse.json({ message: "API key not found" }, { status: 500 });
//         }
//         const res1 = await fetch("https://reseller.dakazinabusinessconsult.com/api/v1/fetch-single-transaction", {
//             method: "POST",  
//             headers: {
//                 "Content-Type": "application/json",
//                 "x-api-key": `${dakaziApiKey}`,
//             },
//             body: JSON.stringify({
//                 transaction_id: `${transaction_id}`,
//             }),

//         });

      
//         let Orderstatus = await res1.json();
//        console.log(Orderstatus);

//          await Order.updateOne(
//             { transaction_id: transaction_id },
//             { status: Orderstatus.order_items[0].status.toLowerCase() }
//         );

//         return NextResponse.json({ status: Orderstatus.order_items[0].status.toLowerCase() }, { status: 200 });
//     } catch (error) {
//         return NextResponse.json({ message: "Error", error: error }, { status: 500 });
//     }
// }





import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
export async function GET() {

  try {
    
  await dbConnect();

  const pendingOrders = await Order.find({});
console.log(pendingOrders);
  for (const order of pendingOrders) {
    const res = await fetch(
      `https://reseller.dakazinabusinessconsult.com/api/v1/fetch-single-transaction?transaction_id=${order.transaction_id}`,
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.DAKAZI_API_KEY   !,
          "Accept": "application/json"
        }
      }
    );

    const data = await res.json();
    console.log("response from dakazi",data);
    const status = data.order_items[0].status.toLowerCase();

    if (data.status !== "pending") {
     await Order.findByIdAndUpdate(order._id, {
        status: status
      });
    }
  }

  return Response.json({ success: true });
} catch (error) {
  return Response.json({ success: false, error: error });
}

}