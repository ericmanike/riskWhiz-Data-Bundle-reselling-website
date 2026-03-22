import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import User from "@/models/User";
import StoreBundle from "@/models/StoreBundle";
import "@/models/Bundle";
import Stores from "@/models/Stores";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const DAKAZI_API_KEY = process.env.DAKAZI_API_KEY;

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        const data = await req.json();
        console.log(data);
        const {

            reference,     // Paystack transaction reference
            storeBundleId, // The ID of the StoreBundle being bought
            phoneNumber,
            network
        } = data;

        if (!storeBundleId || !phoneNumber || !network) {
            console.log("Missing required fields phone number, ", phoneNumber, "storeBundleId", storeBundleId, "network", network);
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        // 1. Fetch the StoreBundle and its underlying Bundle
        const storeBundle = await StoreBundle.findById(storeBundleId).populate("bundle");
        console.log("Store bundle", storeBundle);
        if (!storeBundle || !storeBundle.bundle) {
            return NextResponse.json({ message: "Bundle not found" }, { status: 404 });
        }

        const bundle = storeBundle.bundle as any;
        const customPrice = storeBundle.customPrice!
        const basePrice = bundle.price;
        const profit = customPrice - basePrice;



        console.log("Custom price", customPrice, "base price", basePrice);
        const agentId = storeBundle.agent;
        const agent = await User.findById(agentId);
        console.log("Agent", agent);

        if (!agent) {
            console.log("Agent not found", agentId);
            return NextResponse.json({ message: "Agent not found" }, { status: 404 });
        }
        const agentBalance = agent.walletBalance;

        agent.walletBalance -= customPrice;
        await agent.save();

        const storeWallet = await Stores.findById(agentId);
        console.log("Store wallet", storeWallet);
        if (!storeWallet) {
            return NextResponse.json({ message: "Store account not found" }, { status: 404 });
        } else {
            storeWallet.totalProfit += profit;
            storeWallet.totalSales += 1;
            await storeWallet.save();
        }


        if (agentBalance < customPrice) {
            console.log("Insufficient balance", agentBalance, customPrice);
            return NextResponse.json({ message: "Insufficient balance" }, { status: 400 });
        }




        // Determine Dakazi Network ID
        let networkId;
        if (network === "MTN") networkId = 3;
        else if (network === "Telecel") networkId = 2;
        else if (network.startsWith("AT")) networkId = 4;
        else return NextResponse.json({ message: "Invalid network" }, { status: 400 });

        // 2. Handle Payment Logic
        let finalReference = reference || `store_${Date.now()}`;


        if (!reference) return NextResponse.json({ message: "Missing paystack reference" }, { status: 400 });

        // Verify Paystack payment
        const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
        });
        const paystackData = await verifyRes.json();

        if (!paystackData.status || paystackData.data.status !== "success") {
            return NextResponse.json({ message: "Paystack verification failed" }, { status: 400 });
        }

        // Verify amount (Paystack amount is in kobo)
        const tax = 0.02 * customPrice;
        const totalRequired = Math.round((customPrice + tax) * 100);
        console.log("Payment amount mismatch", paystackData.data.amount / 100, totalRequired / 100);
        if (paystackData.data.amount !== totalRequired) {
            return NextResponse.json({ message: "Payment amount mismatch" }, { status: 400 });
        }




        // 3. Prevent duplicate orders
        const existingOrder = await Order.findOne({ transaction_id: finalReference });
        if (existingOrder) return NextResponse.json({ message: "Duplicate transaction" }, { status: 409 });

        // 4. Create Order with attribution
        const order = await Order.create({
            user: session?.user?.id || undefined,
            transaction_id: "Spaid" + finalReference,
            network: network,
            bundleName: bundle.name.replace("GB", ""),
            price: customPrice,
            originalPrice: basePrice,
            agent: agentId,
            storeBundle: storeBundleId,
            phoneNumber: phoneNumber,
            status: 'pending',
        });
        const storeAccount = await Stores.findById(agentId);
        if (!storeAccount) {
            return NextResponse.json({ message: "Store account not found" }, { status: 404 });
        } else {




        }



        // 5. Place order with Dakazi
        try {
            const dakaziRes = await fetch("https://reseller.dakazinabusinessconsult.com/api/v1/buy-data-package", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-api-key": DAKAZI_API_KEY! },
                body: JSON.stringify({
                    recipient_msisdn: phoneNumber.trim(),
                    network_id: networkId,
                    shared_bundle: Number(bundle.name.replace("GB", "")),
                    incoming_api_ref: finalReference
                })
            });

            const dakaziData = await dakaziRes.json();
            if (dakaziData.success === true) {
                await Order.findByIdAndUpdate(order._id, { transaction_id: "S" + dakaziData.transaction_code });
            } else {
                console.log("Dakazi order placement failed", dakaziData);
                NextResponse.json({ message: "Dakazi order placement failed" }, { status: 400 });
            }
        } catch (err) {
            console.error("Dakazi order placement error:", err);
        }

        return NextResponse.json({
            message: "Order placed successfully",
            orderId: order._id,
            reference: finalReference
        }, { status: 201 });

    } catch (error) {
        console.error("Store purchase error:", error);
        return NextResponse.json({ message: "Unexpected server error" }, { status: 500 });
    }
}
