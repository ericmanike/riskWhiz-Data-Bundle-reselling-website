import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Stores from "@/models/Stores";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Basic admin check
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // 1. Aggregate Order data for all agents/stores
        // This gives us real-time total sales (volume) and total profit (sum of margins)
        const orderStats = await Order.aggregate([
            { $match: { status: 'delivered' } },
            {
                $group: {
                    _id: "$agent",
                    totalSalesAmount: { $sum: "$price" },
                    totalProfitAmount: { 
                        $sum: { $subtract: ["$price", { $ifNull: ["$originalPrice", "$price"] }] } 
                    },
                    orderCount: { $sum: 1 }
                }
            }
        ]);

        // 2. Fetch all stores and populate their owner (agent) details
        const stores = await Stores.find()
            .populate('agent', 'name email phone')
            .lean();

        // 3. Combine store info with aggregated order stats
        const storesWithStats = stores.map(store => {
            const stats = orderStats.find(s => s._id && s._id.toString() === (store.agent as any)?._id?.toString());
            
            return {
                _id: store._id,
                storeName: store.storeName,
                phoneNumber: store.phoneNumber,
                owner: store.agent,
                totalSales: stats ? stats.totalSalesAmount : 0,
                totalProfit: stats ? stats.totalProfitAmount : 0,
                orderCount: stats ? stats.orderCount : 0,
                createdAt: store.createdAt,
                updatedAt: store.updatedAt
            };
        });

        return NextResponse.json(storesWithStats);
    } catch (error) {
        console.error("Admin stores stats error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
