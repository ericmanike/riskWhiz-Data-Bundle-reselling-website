import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Stores from "@/models/Stores";

// PATCH /api/store/name — update the agent's store name
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "agent" && session.user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { storeName, phoneNumber } = await req.json();
        const updateData: any = {};
        
        if (storeName) {
            if (typeof storeName !== "string" || storeName.trim().length < 2) {
                return NextResponse.json({ message: "Store name must be at least 2 characters" }, { status: 400 });
            }
            updateData.storeName = storeName.trim();
        }

        if (phoneNumber) {
             if (typeof phoneNumber !== "string" || phoneNumber.trim().length < 9) {
                return NextResponse.json({ message: "Phone number must be at least 9 characters" }, { status: 400 });
            }
            updateData.phoneNumber = phoneNumber.trim();
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: "No data provided" }, { status: 400 });
        }

        await dbConnect();

        // Update User model (kept for compatibility if storeName changes) and update/upsert Stores model
        const updatePromises = [];
        if (updateData.storeName) {
            updatePromises.push(User.findByIdAndUpdate(session.user.id, { storeName: updateData.storeName }));
        }
        
        updatePromises.push(
            Stores.findOneAndUpdate(
                { agent: session.user.id },
                { ...updateData, agent: session.user.id },
                { upsert: true, new: true }
            )
        );

        await Promise.all(updatePromises);

        return NextResponse.json({ message: "Store updated successfully" });
    } catch (error) {
        console.error("Store name update error:", error);
        return NextResponse.json({ message: "Error updating store name" }, { status: 500 });
    }
}
