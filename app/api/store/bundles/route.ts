import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import StoreBundle from "@/models/StoreBundle";
import Bundle from "@/models/Bundle";
import Stores from "@/models/Stores";

// GET /api/store/bundles — returns the logged-in agent's store bundles (populated)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "agent" && session.user.role !== "admin")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const storeBundles = await StoreBundle.find({ agent: session.user.id })
            .populate("bundle")
            .sort({ createdAt: -1 });

        return NextResponse.json(storeBundles);
    } catch {
        return NextResponse.json({ message: "Error fetching store bundles" }, { status: 500 });
    }
}

// POST /api/store/bundles — add a bundle to agent's store
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "agent" && session.user.role !== "admin")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { bundleId, customPrice } = body;

        if (!bundleId) {
            return NextResponse.json({ message: "Bundle ID required" }, { status: 400 });
        }

        await dbConnect();

        // Verify the store exists and is active for this agent
        const store = await Stores.findOne({ agent: session.user.id });
        if (!store) {
            return NextResponse.json({ message: "Store not found. Please create a store first." }, { status: 404 });
        }

        // Verify the bundle exists and is meant for agents
        const bundle = await Bundle.findById(bundleId);
        if (!bundle) {
            return NextResponse.json({ message: "Bundle not found" }, { status: 404 });
        }
        if (bundle.audience !== 'agent') {
            return NextResponse.json({ message: "Only agent bundles can be added to the store" }, { status: 403 });
        }

        const storeBundle = await StoreBundle.findOneAndUpdate(
            { agent: session.user.id, bundle: bundleId },
            {
                agent: session.user.id,
                bundle: bundleId,
                customPrice: customPrice ?? undefined,
                isVisible: true,
            },
            { upsert: true, new: true }
        );

        return NextResponse.json(storeBundle, { status: 201 });
    } catch {
        return NextResponse.json({ message: "Error adding bundle to store" }, { status: 500 });
    }
}
