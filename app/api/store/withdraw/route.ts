import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Withdrawal from "@/models/Withdrawal";
import User from "@/models/User";
import Stores from "@/models/Stores";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "agent" && session.user.role !== "admin")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { amount, paymentMethod, details } = body;

        if (!amount || amount <= 0 || !paymentMethod || !details) {
            return NextResponse.json({ message: "Invalid withdrawal request details" }, { status: 400 });
        }

        await dbConnect();

        // Ensure the agent has a store and sufficient balance
        const [user, store] = await Promise.all([
            User.findById(session.user.id),
            Stores.findOne({ agent: session.user.id })
        ]);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (!store) {
            return NextResponse.json({ message: "Store not found. Please create a store first." }, { status: 404 });
        }

        if (store.totalProfit < amount) {
            return NextResponse.json({ message: "Insufficient profit balance for withdrawal" }, { status: 400 });
        }

        // Deduct from store profit
        store.totalProfit -= amount;
        await store.save();

        // Create the withdrawal record
        const withdrawal = await Withdrawal.create({
            agentId: user._id,
            amount,
            status: "pending",
            paymentMethod,
            details,
        });

        return NextResponse.json({ message: "Withdrawal request submitted successfully", withdrawal }, { status: 201 });
    } catch (error) {
        console.error("Withdrawal API error:", error);
        return NextResponse.json({ message: "Error processing withdrawal request" }, { status: 500 });
    }
}
