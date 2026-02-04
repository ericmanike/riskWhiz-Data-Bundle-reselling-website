"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import clsx from 'clsx';
import Image from 'next/image';

export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const isAuthPage = pathname?.startsWith('/auth');
    if (isAuthPage) return null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-10 bg-[#0e0947] text-white md:flex items-center justify-between px-6 py-4  text-black shadow-lg shadow-black/10">

            <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.png" alt="RiskWhiz Logo" width={60} height={60} className='text-white' />
                <span className="text-xl font-bold text-blue-600">RiskWhiz</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
                <Link
                    href="/dashboard"
                    className={clsx(
                        " text-sm md:text-[16px] font-medium text-white hover:text-blue-700 transition-colors",
                        pathname === '/dashboard' ? "text-gray-600 font-bold" : "text-slate-950"
                    )}
                >
                    Dashboard
                </Link>
                <Link
                    href="/buy"
                    className={clsx(
                        " text-sm md:text-[16px] font-medium text-white hover:text-blue-700  transition-colors",
                        pathname === '/buy' ? "text-blue-600 font-bold" : "text-slate-950"                )}
                >
                    Buy Data
                </Link>
                
                {/* <Link
                    href="/agents"
                    className={clsx(
                        " text-sm md:text-[16px] font-medium hover:text-blue-700 transition-colors",
                        pathname === '/agents' ? "text-blue-600 font-bold" : "text-slate-950"
                    )}
                >
                    Become an Agent
                </Link> */}

                {session ? (
                    <div className="flex items-center gap-4 pl-6 border-l border-blue-500">
                        <Link href="/profile" className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            
                            <div className="w-8 h-8 rounded-full  flex items-center justify-center text-white bg-blue-600">
                                <User size={16} />
                            </div>
                           
                            <span className="text-sm font-medium">{session.user?.name}</span>
                        </div>
                         </Link>
                        <button
                            onClick={() => signOut()}
                            className="p-2 hover:bg-white/10 rounded-full text-slate-600 transition-colors"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                ) : (
                    <Link
                        href="/auth/login"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
}
