"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, History } from "lucide-react";

export default function StoreNavbar() {
    const pathname = usePathname();

    // Extract store name from pathname: /store/[storename]
    const parts = pathname?.split("/") || [];
    // If it's /store/[storename] or /store/[storename]/buy
    const isPublicStore = parts.length >= 3 && parts[1] === "store";
    const storename = isPublicStore ? parts[2] : null;

    // Decode and format store name
    let displayLogo = "STORE";
    if (storename) {
        displayLogo = decodeURIComponent(storename).replace(/-/g, " ").toUpperCase();
    } else if (parts[1] === "store") {
        displayLogo = "MY STORE";
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-100 px-4 md:px-8 py-3 h-16 flex items-center justify-between shadow-sm">
            <Link href={storename ? `/store/${storename}` : "/store"} className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-orange-200 group-hover:rotate-6 transition-all duration-300">
                    {displayLogo[0]}
                </div>
                <span className="font-black text-lg md:text-xl tracking-tighter text-zinc-900 group-hover:text-orange-600 transition-colors uppercase">
                    {displayLogo}
                </span>
            </Link>

            <div className="flex items-center gap-2 md:gap-4">
                <Link
                    href={storename ? `/store/${storename}/track` : "/history"}
                    className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold px-3 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 transition-all active:scale-95"
                >
                    <History size={14} className="md:w-4 md:h-4 w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Track Order</span>
                    <span className="sm:hidden">Track</span>
                </Link>
            </div>
        </nav>
    );
}
