import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";

// GET /api/store/orders — returns the logged-in agent's recent orders
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "agent" && session.user.role !== "admin")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const orders = await Order.find({ agent: session.user.id })
            .sort({ createdAt: -1 })
            .limit(50)
            .select("bundleName network phoneNumber price status createdAt transaction_id")
            .lean();

        return NextResponse.json(orders);
    } catch (error) {
        console.error("Store orders API error:", error);
        return NextResponse.json({ message: "Error fetching orders" }, { status: 500 });
    }
}
