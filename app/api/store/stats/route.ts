import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Stores from "@/models/Stores";

// GET /api/store/stats — returns the logged-in agent's sales stats + store name
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "agent" && session.user.role !== "admin")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Use Stores model for store-related data
        const store = await Stores.findOne({ agent: session.user.id });
        const user = await User.findById(session.user.id).select("walletBalance");

        return NextResponse.json({
            storeName: store?.storeName ?? "",
            totalSales: store?.totalSales ?? 0,
            revenue: store?.totalProfit ?? 0, // In this context, total profit is their revenue
            walletBalance: user?.walletBalance ?? 0,
        });
    } catch (error) {
        console.error("Stats API error:", error);
        return NextResponse.json({ message: "Error fetching stats" }, { status: 500 });
    }
}
