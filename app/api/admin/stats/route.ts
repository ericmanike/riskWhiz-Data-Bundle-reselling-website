import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Order from "@/models/Order";


export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Basic admin check (assuming role is on user session)
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const userCount = await User.countDocuments();
        const orderCount = await Order.countDocuments();
        const salesResult = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, total: { $sum: "$price" } } }
        ]);
        const totalSales = salesResult.length > 0 ? salesResult[0].total : 0;

        return NextResponse.json({
            users: userCount,
            orders: orderCount,
            sales: totalSales
        });
    } catch (error) {
        console.error("Stats error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
