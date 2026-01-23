import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Bundle from "@/models/Bundle";

export async function GET() {


    try {

        



        await dbConnect();
        const bundles = await Bundle.find({ isActive: true }).sort({ network: 1, price: 1 });
      
    


        return NextResponse.json(bundles);
    } catch (error) {
        return NextResponse.json({ message: "Error fetching bundles" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        await dbConnect();

        const bundle = await Bundle.create(body);

        return NextResponse.json(bundle, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Error creating bundle" }, { status: 500 });
    }
}
