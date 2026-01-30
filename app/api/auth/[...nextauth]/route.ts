import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { loginRateLimit } from "@/lib/ratelimit";
import { NextResponse, NextRequest } from "next/server";

const handler = NextAuth(authOptions);

async function POST(req: Request, ctx: any) {

    let identifier
    // Read body as text to support both JSON and Form Data without breaking NextAuth
    const bodyText = await req.text();

    try {
        // Try parsing as JSON
        const body = JSON.parse(bodyText);
        if (body?.email) identifier = body.email;
    } catch {
        // Fallback to Form Data (x-www-form-urlencoded)
        const params = new URLSearchParams(bodyText);
        const email = params.get("email");
        if (email) identifier = email;
    }

    console.log("Rate Limit Identifier:", identifier);
    const { success } = await loginRateLimit.limit(identifier);

    if (!success) {
        return NextResponse.json(
            { message: "Too many login attempts. Please try again later." },
            { status: 429 }
        );
    }

    // Pass a new NextRequest with the read body to NextAuth
    const newReq = new NextRequest(req.url, {
        method: req.method,
        headers: req.headers,
        body: bodyText,
    });

    return handler(newReq, ctx);
}

export { handler as GET, POST };
