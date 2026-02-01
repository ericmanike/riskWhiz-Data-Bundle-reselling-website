import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { userId, amount } = await req.json();

        if (!userId || !amount) {
            return NextResponse.json({ message: "User ID and amount are required" }, { status: 400 });
        }

        if (amount <= 0) {
            return NextResponse.json({ message: "Amount must be greater than 0" }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Add amount to user's wallet balance
        user.walletBalance += amount;
        await user.save();

        console.log(`Admin ${session.user.email} added ${amount} to ${user.email}'s wallet. New balance: ${user.walletBalance}`);

        return NextResponse.json({
            message: "Balance topped up successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                walletBalance: user.walletBalance
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Admin top up error:", error);
        return NextResponse.json({ message: "Error topping up user balance" }, { status: 500 });
    }
}
