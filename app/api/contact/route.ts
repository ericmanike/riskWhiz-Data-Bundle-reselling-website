import { NextResponse } from "next/server";
import Resend from "resend";
export async function POST(req: Request) {
    try {
        const { name, email, message } = await req.json();
        return NextResponse.json({ message: "Form submitted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error submitting form" }, { status: 500 });
    }
}