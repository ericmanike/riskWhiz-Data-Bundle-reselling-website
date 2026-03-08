import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Withdrawal from "@/models/Withdrawal";
import User from "@/models/User";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { status } = body;

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ message: "Invalid status update" }, { status: 400 });
        }

        await dbConnect();

        // 1. Await params resolution if it is asynchronous in this context, 
        // Though technically params usually works fine, to be safe with Next 15:
        const { id } = await params;

        const withdrawal = await Withdrawal.findById(id);
        if (!withdrawal) {
            return NextResponse.json({ message: "Withdrawal not found" }, { status: 404 });
        }

        if (withdrawal.status !== 'pending') {
            return NextResponse.json({ message: "Cannot change the status of an already processed withdrawal" }, { status: 400 });
        }

        // 2. update withdrawal status
        withdrawal.status = status;
        await withdrawal.save();

        // 3. If rejected, refund the wallet
        if (status === 'rejected') {
            const agent = await User.findById(withdrawal.agentId);
            if (agent) {
                agent.walletBalance = (agent.walletBalance || 0) + withdrawal.amount;
                await agent.save();
            }
        }

        return NextResponse.json({ message: `Withdrawal ${status} successfully`, withdrawal });

    } catch (error) {
        console.error("Failed to process withdrawal:", error);
        return NextResponse.json({ message: "Error updating withdrawal process" }, { status: 500 });
    }
}
