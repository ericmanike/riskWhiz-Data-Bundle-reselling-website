import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";


export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { network, bundleName, price, phoneNumber, reference } = await req.json();

        if (!network || !bundleName || !price || !phoneNumber) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

       

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY 

    if(!PAYSTACK_SECRET_KEY){
        //console.log('Paystack secret key not found')
      return NextResponse.json({ message: "unexpected error occurred" }, { status: 500 });
    }
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    })

    const paystackData = await verifyResponse.json()

    console.log('Payment verification response:', paystackData)
    if (!paystackData.data) {
      return NextResponse.json({ message: "Payment verification failed" }, { status: 400 });
    }

    const { amount, currency } = paystackData.data

    if (amount / 100 !== price) {
      return NextResponse.json({ message: "Payment amount does not match" }, { status: 400 });
    }

    if (currency !== "GHS") {
      return NextResponse.json({ message: "Payment currency is not GHS" }, { status: 400 });
    }



if( paystackData.data.status !== 'success'){
  return NextResponse.json({ message: "Payment verification failed" }, { status: 400 });
}


    const order = await Order.create({
            user: session.user.id,
            network,
            bundleName,
            price,
            phoneNumber,
            status: 'pending', // Pending until admin manually updates it
        });

      //  console.log('📦 New order created:', order);

        return NextResponse.json({ message: "Order created successfully", order }, { status: 201 });
    } catch (error) {
       // console.error("Order creation error:", error);
        return NextResponse.json({ message: "Error creating order" }, { status: 500 });
    }
}
