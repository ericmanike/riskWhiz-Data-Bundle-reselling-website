"use client";

import { Shield, CheckCircle2, ShoppingBag, Users, Package, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const tabs = [
        { id: '/admin', label: 'Stats & Orders', icon: CheckCircle2 },
        { id: '/admin/users', label: 'Users', icon: Users },
        { id: '/admin/bundles', label: 'Bundles', icon: Package },
        { id: '/admin/withdrawals', label: 'Withdrawals', icon: Wallet },
    ];

    return (
        <div className="min-h-screen bg-zinc-50 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">Admin Dashboard</h1>
                        <p className="text-zinc-500 text-sm mt-1">Manage users, orders, and system settings.</p>
                    </div>
                    <div className="flex items-center">
                        <div className="px-3 py-1.5 bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-2 text-xs md:text-sm text-blue-700 font-medium">
                            <Shield size={14} className="md:size-4" /> Admin Access
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-zinc-200">
                    <div className="flex gap-6 overflow-x-auto pb-1">
                        {tabs.map((tab) => {
                            const isActive = pathname === tab.id;
                            return (
                                <Link
                                    key={tab.id}
                                    href={tab.id}
                                    className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-all relative ${
                                        isActive ? 'text-blue-600' : 'text-zinc-500 hover:text-zinc-900'
                                    }`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="space-y-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
