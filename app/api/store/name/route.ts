import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

// PATCH /api/store/name — update the agent's store name
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "agent") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { storeName } = await req.json();
        if (!storeName || typeof storeName !== "string" || storeName.trim().length < 2) {
            return NextResponse.json({ message: "Store name must be at least 2 characters" }, { status: 400 });
        }

        await dbConnect();

        await User.findByIdAndUpdate(session.user.id, {
            storeName: storeName.trim(),
        });

        return NextResponse.json({ message: "Store name updated" });
    } catch {
        return NextResponse.json({ message: "Error updating store name" }, { status: 500 });
    }
}
