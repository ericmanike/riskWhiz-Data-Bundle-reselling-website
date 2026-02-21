import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // req.nextauth.token is automatically populated by withAuth
        const token = req.nextauth.token;
        const role = token?.role;
        const pathname = req.nextUrl.pathname;

        // 1. Protect Admin Routes: Redirect non-admins to dashboard
        if (pathname.startsWith("/admin") && role !== "admin") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        // 2. Protect User Routes: Redirect admins to admin dashboard
        // Admins shouldn't be buying bundles for themselves in this flow usually, or at least
        // the request explicitly asked to protect "dashboard from admin".
        // I'll include /dashboard, /buy, and /history as user-centric routes.

       if ((pathname.startsWith("/dashboard") || pathname.startsWith("/buy") || pathname.startsWith("/history")) && role === "admin") {
            return NextResponse.redirect(new URL("/admin", req.url));
        }   



     
        
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/auth/login",
        },
    }
);

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/buy/:path*",
        "/admin/:path*",
        "/profile/:path*",
        "/history/:path*"
    ],
};
