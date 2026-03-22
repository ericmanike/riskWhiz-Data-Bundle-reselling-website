import { NextResponse , NextRequest} from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import User from "@/models/User";
import Bundle from "@/models/Bundle";
import StoreBundle from "@/models/StoreBundle";
import Stores from "@/models/Stores";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { network, bundleName, price, phoneNumber } = await req.json();

        console.log('Received wallet purchase data:', { network, bundleName, price, phoneNumber });

        if (!network || !bundleName || !price || !phoneNumber) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }



        await dbConnect();

        const dbPrice = await Bundle.findOne({ name:bundleName+"GB", network:network,  audience: session.user.role, isActive:true }).select('price');   
       const realPrice = dbPrice ? dbPrice.price : null;

        if (realPrice === null) {
            return NextResponse.json({ message: "Bundle not found" }, { status: 404 });
        }

        console.log('Database price fetched:', dbPrice);       

        // Get user and check wallet balance
        const user = await User.findById(session.user.id);
        console.log('User Topping up:', user);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Check if user has sufficient balance
        if (user.walletBalance < realPrice) {
            return NextResponse.json({
                message: "Insufficient wallet balance",
                balance: user.walletBalance,
                required: realPrice
            }, { status: 400 });
        }

        const DAKAZI_API_KEY = process.env.DAKAZI_API_KEY;

        if (!DAKAZI_API_KEY) {
            return NextResponse.json({ message: "Unexpected error occurred" }, { status: 500 });
        }

        // Determine network ID
        let networkId;
        if (network === "MTN") {
            networkId = 3;
        } else if (network === "Telecel") {
            networkId = 2;
        } else if (network.startsWith("AT")) {
            networkId = 4;
        } else {
            return NextResponse.json({ message: "Invalid network" }, { status: 400 });
        }

        console.log('Network ID:', networkId);

      
        // Place order with Dakazi
        const placeOrder = await fetch(
            "https://reseller.dakazinabusinessconsult.com/api/v1/buy-data-package",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": `${DAKAZI_API_KEY}`,
                }, 
                body: JSON.stringify({
                    recipient_msisdn: phoneNumber.trim(),
                    network_id: networkId,
                    shared_bundle: Number(bundleName),
                    incoming_api_ref: "store"+Date.now()
                })
            }

        );

       
        let orderRes;

try {
    const raw = await placeOrder.text();
    orderRes = JSON.parse(raw);
} catch(error) {
    console.log('Error placing order:', error);
    await User.findByIdAndUpdate(session.user.id, {
        $inc: { walletBalance: realPrice }
    });

    return NextResponse.json({
        message: "Provider error. Wallet refunded."
    }, { status: 500 });
}
        console.log('Order placement response:', orderRes);
  
       

   
        // user.walletBalance = Number(user.walletBalance) - Number(price);

 
        // Create order record
        const order = await Order.create({
            user: session.user.id,
            transaction_id: "store"+orderRes.transaction_code,
            network: network,
            bundleName: bundleName,
            price: realPrice,
            phoneNumber: phoneNumber,
            status: 'pending',
        });

        console.log('📦 New store order created:', order);
        return NextResponse.json({
            message: "Order created successfully",
            order,
        
        }, { status: 201 });    

    } catch (error) {
        console.error("Store purchase error:", error);
        return NextResponse.json({ message: "Error processing store purchase" }, { status: 500 });
    }
}
