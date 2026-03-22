import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Stores from "@/models/Stores";
import StoreBundle from "@/models/StoreBundle";
import mongoose from "mongoose";
import "@/models/Bundle"; // Ensure Bundle model is initialized for populate

export async function GET(
    req: Request,
    { params }: { params: Promise<{ storename: string }> }
) {
    try {
        const { storename } = await params;
        await dbConnect();

        const decoded = decodeURIComponent(storename);
        const searchString = decoded.replace(/-/g, " ");

        // Find the store/agent by name or ID
        let store: any = await Stores.findOne({
            storeName: { $regex: new RegExp(`^${searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") }
        });

        if (!store && mongoose.Types.ObjectId.isValid(storename)) {
            store = await Stores.findOne({ agent: storename });
        }

        if (!store) {
            return NextResponse.json({ message: "Store not found" }, { status: 404 });
        }

        // Fetch store bundles
        const storeBundles = await StoreBundle.find({
            agent: store.agent,
            isVisible: true,
        }).populate("bundle");

        // Map and sort (low to high size)
        const bundles = storeBundles
            .filter(sb => sb.bundle && (sb.bundle as any).isActive)
            .sort((a, b) => {
                const sizeA = (a.bundle as any).sizeValue || 0;
                const sizeB = (b.bundle as any).sizeValue || 0;
                return sizeA - sizeB;
            })
            .map(sb => {
                const b = sb.bundle as any;
                return {
                    _id: b._id,
                    storeBundleId: sb._id,
                    name: b.name,
                    network: b.network,
                    price: sb.customPrice ?? b.price,
                    originalPrice: b.price,
                    agentId: store.agent
                };
            });

        return NextResponse.json(bundles);
    } catch (error) {
        console.error("Public store bundles fetch error:", error);
        return NextResponse.json({ message: "Error fetching bundles" }, { status: 500 });
    }
}
