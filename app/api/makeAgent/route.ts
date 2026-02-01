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

        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (user.role === 'admin') {
            return NextResponse.json({ message: "Cannot modify admin role" }, { status: 400 });
        }

        if (user.role === 'agent') {
            return NextResponse.json({ message: "User is already an agent" }, { status: 400 });
        }

        // Update user role to agent
        user.role = 'agent';
        await user.save();

        console.log(`User ${user.email} promoted to agent by admin ${session.user.email}`);

        return NextResponse.json({
            message: "User successfully promoted to agent",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Make agent error:", error);
        return NextResponse.json({ message: "Error promoting user to agent" }, { status: 500 });
    }
}
