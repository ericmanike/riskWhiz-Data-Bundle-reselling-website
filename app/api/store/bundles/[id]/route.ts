import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import StoreBundle from "@/models/StoreBundle";
import Stores from "@/models/Stores";

// PATCH /api/store/bundles/[id] — update custom price for a store bundle
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "agent" && session.user.role !== "admin")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id } = await params;
        const { customPrice } = body;

        // Allow null to reset, or a positive number to set
        let updateValue: number | null = null;
        if (customPrice !== null && customPrice !== undefined) {
            const price = parseFloat(customPrice);
            if (isNaN(price) || price <= 0) {
                return NextResponse.json({ message: "Price must be a positive number" }, { status: 400 });
            }
            updateValue = price;
        }

        await dbConnect();

        // Check if store exists
        const store = await Stores.findOne({ agent: session.user.id });
        if (!store) {
            return NextResponse.json({ message: "Store not found" }, { status: 404 });
        }

        const updated = await StoreBundle.findOneAndUpdate(
            { _id: id, agent: session.user.id },
            { customPrice: updateValue },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Price updated", customPrice: updated.customPrice });
    } catch {
        return NextResponse.json({ message: "Error updating price" }, { status: 500 });
    }
}

// DELETE /api/store/bundles/[id] — remove a bundle from agent's store
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "agent" && session.user.role !== "admin")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        const deleted = await StoreBundle.findOneAndDelete({
            _id: id,
            agent: session.user.id,
        });

        if (!deleted) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Removed" });
    } catch {
        return NextResponse.json({ message: "Error removing bundle" }, { status: 500 });
    }
}
