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

        // Fetch all stores and populate their owner (agent) details
        const stores = await Stores.find()
            .populate('agent', 'name email phone')
            .lean();

        // Return store info with their total sales and profit from the Store model
        const storesWithStats = stores.map(store => ({
            _id: store._id,
            storeName: store.storeName,
            phoneNumber: store.phoneNumber,
            owner: store.agent,
            totalSales: store.totalSales || 0,
            totalProfit: store.totalProfit || 0,
            createdAt: store.createdAt,
            updatedAt: store.updatedAt
        }));

        return NextResponse.json(storesWithStats);
    } catch (error) {
        console.error("Admin stores stats error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
