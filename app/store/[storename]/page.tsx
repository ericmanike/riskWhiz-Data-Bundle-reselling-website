import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import StoreBundle from "@/models/StoreBundle";
import "@/models/Bundle"; // Ensure Bundle model is initialized before populate
import type { Metadata } from "next";
import Stores from "@/models/Stores";
import mongoose from "mongoose";

interface Props {
    params: Promise<{ storename: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { storename } = await params;
    await dbConnect();

    const decoded = decodeURIComponent(storename);
    const searchString = decoded.replace(/-/g, " ");

    let agent: any = await Stores.findOne({
        storeName: { $regex: new RegExp(`^${searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") }
    }).select("storeName");

    if (!agent && mongoose.Types.ObjectId.isValid(storename)) {
        agent = await Stores.findOne({ agent: storename }).select("storeName");
    }
    const displayName = agent?.storeName || `Agent  Store`;
    return {
        title: `${displayName} | Risk Whiz`,
        description: `Buy data bundles from ${displayName} on Risk Whiz.`,
    };
}

const NETWORK_COLORS: Record<string, { bg: string; text: string; ring: string; badge: string }> = {
    MTN: { bg: "bg-yellow-400", text: "text-[#51291e]", ring: "ring-yellow-300", badge: "bg-yellow-100 text-yellow-800" },
    Telecel: { bg: "bg-red-600", text: "text-white", ring: "ring-red-300", badge: "bg-red-100 text-red-700" },
    AirtelTigo: { bg: "bg-blue-700", text: "text-white", ring: "ring-blue-300", badge: "bg-blue-100 text-blue-800" },
};
import StoreClient from "./StoreClient";

export default async function PublicStorePage({ params }: Props) {
    const { storename } = await params;
    await dbConnect();

    const decoded = decodeURIComponent(storename);
    const searchString = decoded.replace(/-/g, " ");

    let agent: any = await Stores.findOne({
        storeName: { $regex: new RegExp(`^${searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") }
    }).select("storeName agent");

    // Fallback: try finding by Agent ID if it qualifies as a valid ObjectId
    if (!agent && mongoose.Types.ObjectId.isValid(storename)) {
        agent = await Stores.findOne({ agent: storename }).select("storeName agent");
    }
    // if (!agent || agent.role !== "agent" && agent.role !== "admin") notFound();

    const storeName = agent?.storeName?.trim() || ` Agents's Store`;

    // Fetch store bundles using the agent ID found (or the storename if it was already an ID)
    const agentId = agent?.agent || storename;

    const storeBundlesRaw = await StoreBundle.find({
        agent: agentId,
        isVisible: true,
    }).populate("bundle");

    // Filter out bundles where populate may have failed or bundle is inactive
    const storeBundles = storeBundlesRaw.filter(
        (sb) => sb.bundle && (sb.bundle as any).isActive
    );

    // Serialize for the Client Component
    const serializedBundles = JSON.parse(JSON.stringify(storeBundles));

    return (
        <StoreClient
            storeName={storeName}
            storeSlug={storename}
            agentId={agentId.toString()}
            storeBundles={serializedBundles}
        />
    );
}
