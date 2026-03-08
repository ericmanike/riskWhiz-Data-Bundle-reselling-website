import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import User from "@/models/User";

// GET /api/store/stats — returns the logged-in agent's sales stats + store name
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "agent") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findById(session.user.id).select("storeName walletBalance");

        const totalSales = await Order.countDocuments({ user: session.user.id });

        const revenueResult = await Order.aggregate([
            { $match: { user: session.user.id, status: "delivered" } },
            { $group: { _id: null, total: { $sum: "$price" } } },
        ]);

        return NextResponse.json({
            storeName: user?.storeName ?? "",
            totalSales,
            revenue: revenueResult[0]?.total ?? 0,
            walletBalance: user?.walletBalance ?? 0,
        });
    } catch {
        return NextResponse.json({ message: "Error fetching stats" }, { status: 500 });
    }
}
