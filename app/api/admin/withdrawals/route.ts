import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Withdrawal from "@/models/Withdrawal";
import "@/models/User"; // Ensure User model is loaded

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        // Fetch all withdrawals, populate agent details
        const withdrawals = await Withdrawal.find()
            .populate('agentId', 'name email phoneNumber')
            .sort({ createdAt: -1 });

        return NextResponse.json(withdrawals);
    } catch (error) {
        console.error("Failed to fetch withdrawals:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
