'use client'
import React from 'react'
import { useSession } from 'next-auth/react'
import { Store, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

function CreateStore({ hasStore }: { hasStore?: boolean }) {
    const { data: session } = useSession()

    if (session?.user?.role !== 'agent') return null

    return (
        <Link href="/store" className="block w-full">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 p-[1px] shadow-lg hover:shadow-orange-300/40 transition-all duration-300">
                <div className="relative rounded-xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 p-4 flex items-center justify-between group">
                    {/* Animated shimmer */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%]" style={{ transitionDuration: '700ms' }} />

                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                            <Store size={22} className="text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm leading-tight">{hasStore ? "Manage Your Store" : "Create Your Store"}</p>
                            <p className="text-white/80 text-xs mt-0.5">{hasStore ? "View stats, withdraw and add bundles" : "Sell data bundles as an agent"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-white/90 bg-white/20 px-2.5 py-1 rounded-full">
                            <Sparkles size={11} />
                            Agent
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-200">
                            <ArrowRight size={16} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default CreateStore
