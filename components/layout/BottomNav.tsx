"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wifi, User ,LayoutDashboard, Handshake } from 'lucide-react';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';

export default function BottomNav() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const isAuthPage = pathname?.startsWith('/auth');
    if (isAuthPage) return null;

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Wifi, label: 'Buy Data', href: '/buy' },
        // { icon: Handshake, label: 'Agents', href: '/agents' },
        { icon: User, label: 'Profile', href: '/profile' },
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0  bg-white text-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe pt-2 px-6">
            <div className="flex justify-between items-end pb-3">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center gap-1 min-w-16"
                        >
                            <div
                                className={clsx(
                                    "p-2 rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-slate-600 text-white shadow-lg -translate-y-1.5"
                                        : "text-slate-600 hover:text-white"
                                )}
                            >
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span
                                className={clsx(
                                    "text-[10px] font-medium transition-colors",
                                    isActive ? "text-blue-600" : "text-slate-600"
                                )}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
