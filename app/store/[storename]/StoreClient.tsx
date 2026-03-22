'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/Card";
import { Store, Wifi } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface StoreClientProps {
    storeName: string;
    storeSlug: string;
    agentId: string;
    storeBundles: any[];
}

const NETWORK_COLORS: Record<string, { bg: string; text: string; ring: string; badge: string }> = {
    MTN: { bg: "bg-yellow-400", text: "text-[#51291e]", ring: "ring-yellow-300", badge: "bg-yellow-100 text-yellow-800" },
    Telecel: { bg: "bg-red-600", text: "text-white", ring: "ring-red-300", badge: "bg-red-100 text-red-700" },
    AirtelTigo: { bg: "bg-blue-700", text: "text-white", ring: "ring-blue-300", badge: "bg-blue-100 text-blue-800" },
};

export default function StoreClient({ storeName, storeSlug, agentId, storeBundles }: StoreClientProps) {
    const [networkFilter, setNetworkFilter] = useState<'all' | 'MTN' | 'Telecel' | 'AirtelTigo'>('all');

    // Filter and sort bundles
    const sortedBundles = [...storeBundles].sort((a, b) => {
        const priceA = a.customPrice ?? a.bundle?.price ?? 0;
        const priceB = b.customPrice ?? b.bundle?.price ?? 0;
        return priceA - priceB;
    });

    const filteredBundles = sortedBundles.filter(sb => {
        if (!sb.bundle) return false;

        const net = sb.bundle.network;
        return networkFilter === 'all' || net === networkFilter;
    });

    // Group by network
    const grouped: Record<string, typeof storeBundles> = {};
    for (const sb of filteredBundles) {
        const net = sb.bundle.network as string;
        if (!grouped[net]) grouped[net] = [];
        grouped[net].push(sb);
    }

    const networks = Object.keys(grouped)
        .sort((a, b) => { const o: any = { MTN: 1, Telecel: 2, AirtelTigo: 3 }; return (o[a] || 9) - (o[b] || 9); });
    const hasAnyBundles = storeBundles.length > 0;

    return (
        <div className="min-h-screen">
            <div className="w-[95%] md:w-[70%] mx-auto px-4 pb-16 pt-24 md:pt-28">

                {/* Store Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-200">
                        <Store size={36} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">{storeName}</h1>
                    <p className="text-zinc-500 text-sm mt-1">Powered by <span className="font-semibold text-orange-500">Risk Whiz</span></p>

                    {/* Live badge */}
                    <span className="inline-flex items-center gap-1.5 mt-3 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Open &amp; Active
                    </span>
                </div>

                {hasAnyBundles && (
                    <div className="flex flex-wrap items-center gap-2 mb-8 bg-zinc-50 p-1.5 rounded-xl border border-zinc-100">
                        {(['all', 'MTN', 'Telecel', 'AirtelTigo'] as const).map(net => (
                            <button
                                key={net}
                                onClick={() => setNetworkFilter(net)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${networkFilter === net
                                    ? 'bg-white text-orange-600 shadow-sm border border-orange-200/50'
                                    : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100'
                                    }`}
                            >
                                {net === 'all' ? 'All Networks' : net}
                            </button>
                        ))}
                    </div>
                )}

                {/* Empty state entirely */}
                {!hasAnyBundles && (
                    <Card className="text-center py-16 border-dashed border-2 border-zinc-200">
                        <CardContent>
                            <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Wifi size={24} className="text-zinc-400" />
                            </div>
                            <p className="font-semibold text-zinc-600">No bundles yet</p>
                            <p className="text-sm text-zinc-400 mt-1">This agent hasn&apos;t added any bundles to their store.</p>
                        </CardContent>
                    </Card>
                )}

                {/* No matching bundles for search/filter */}
                {hasAnyBundles && networks.length === 0 && (
                    <div className="text-center py-12">
                        <Wifi size={32} className="mx-auto text-zinc-300 mb-3" />
                        <p className="text-zinc-600 font-medium">No bundles found for this network.</p>
                        <p className="text-zinc-400 text-sm mt-1">Try selecting a different network filter.</p>
                        <button
                            onClick={() => setNetworkFilter('all')}
                            className="mt-4 text-orange-500 font-semibold hover:text-orange-600 text-sm"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Bundles grouped by network */}
                {networks.map((network) => {
                    const colors = NETWORK_COLORS[network] ?? {
                        bg: "bg-zinc-700", text: "text-white", ring: "ring-zinc-300", badge: "bg-zinc-100 text-zinc-700"
                    };
                    const networkBundles = grouped[network];

                    return (
                        <div key={network} className="mb-8">
                            {/* Network header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center font-bold text-lg shadow-sm`}>
                                    {network[0]}
                                </div>
                                <div>
                                    <h2 className="font-bold text-zinc-900 text-lg leading-tight">{network}</h2>
                                    <p className="text-xs text-zinc-400">{networkBundles.length} bundle{networkBundles.length !== 1 ? "s" : ""} available</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {networkBundles.map((sb) => {
                                    const bundle = sb.bundle as any;
                                    const displayPrice = sb.customPrice ?? bundle.price;

                                    return (
                                        <Link
                                            key={sb._id.toString()}
                                            href={`/store/${storeSlug}/buy?network=${encodeURIComponent(network)}&size=${encodeURIComponent(bundle.name)}&price=${encodeURIComponent(displayPrice)}&bundle=${encodeURIComponent(bundle._id)}&ref=${agentId}&storeBundleId=${encodeURIComponent(sb._id)}`}
                                            className="block"
                                        >
                                            <div className={`relative group rounded-2xl p-4 ${colors.bg} ${colors.text} shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-200 cursor-pointer`}>
                                                {/* Network badge */}
                                                <span className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${colors.badge}`}>
                                                    {network}
                                                </span>

                                                <Wifi size={20} className="opacity-70 mb-2" />
                                                <p className="font-extrabold text-xl leading-tight">{bundle.name}</p>
                                                <p className="font-semibold text-sm opacity-90 mt-0.5">{formatCurrency(displayPrice)}</p>

                                                <div className="mt-4 bg-white text-black py-2 rounded-xl text-center text-xs font-bold shadow-sm transition-colors group-hover:bg-zinc-100">
                                                    Buy Now
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {/* Footer note */}
                <p className="text-center text-xs text-zinc-400 mt-6">
                    Payments are secure &amp; processed by <span className="font-medium">Paystack</span>
                </p>
            </div>
        </div>
    );
}

