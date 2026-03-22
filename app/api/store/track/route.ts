import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import Stores from "@/models/Stores";
import mongoose from "mongoose";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const phoneNumber = searchParams.get("phoneNumber");
        const storeSlug = searchParams.get("storeSlug");

        if (!phoneNumber) {
            return NextResponse.json({ message: "Phone number is required" }, { status: 400 });
        }

        await dbConnect();

        let query: any = { phoneNumber: phoneNumber.trim() };

        // If a store slug is provided, we try to filter orders for that specific store
        if (storeSlug) {
            const decoded = decodeURIComponent(storeSlug);
            const searchString = decoded.replace(/-/g, " ");

            let store: any = await Stores.findOne({
                storeName: { $regex: new RegExp(`^${searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") }
            }).select("agent");

            if (!store && mongoose.Types.ObjectId.isValid(storeSlug)) {
                store = await Stores.findOne({ agent: storeSlug }).select("agent");
            }

            if (store) {
                query.agent = store.agent;
            }
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(20)
            .select("bundleName network price status createdAt transaction_id");

        return NextResponse.json(orders);
    } catch (error) {
        console.error("Tracking API error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
