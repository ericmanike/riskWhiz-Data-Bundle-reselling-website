import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import StoreBundle from "@/models/StoreBundle";
import { Card, CardContent } from "@/components/ui/Card";
import { Store, Wifi } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
    params: Promise<{ agentId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { agentId } = await params;
    await dbConnect();
    const agent = await User.findById(agentId).select("name storeName");
    const displayName = agent?.storeName || `${agent?.name}'s Store`;
    return {
        title: `${displayName} | Risk Whiz`,
        description: `Buy data bundles from ${displayName} on Risk Whiz.`,
    };
}

const NETWORK_COLORS: Record<string, { bg: string; text: string; ring: string; badge: string }> = {
    MTN: { bg: "bg-yellow-400", text: "text-[#51291e]", ring: "ring-yellow-300", badge: "bg-yellow-100 text-yellow-800" },
    Telecel: { bg: "bg-red-600", text: "text-white", ring: "ring-red-300", badge: "bg-red-100 text-red-700" },
    AirtelTigo: { bg: "bg-blue-700", text: "text-white", ring: "ring-blue-300", badge: "bg-blue-100 text-blue-800" },
};

export default async function PublicStorePage({ params }: Props) {
    const { agentId } = await params;
    await dbConnect();

    const agent = await User.findById(agentId).select("name storeName role");
    if (!agent || agent.role !== "agent") notFound();

    const storeName = agent.storeName?.trim() || `${agent.name}'s Store`;

    // Fetch store bundles with bundle details populated
    const storeBundlesRaw = await StoreBundle.find({
        agent: agentId,
        isVisible: true,
    }).populate("bundle");

    // Filter out bundles where populate may have failed or bundle is inactive
    const storeBundles = storeBundlesRaw.filter(
        (sb) => sb.bundle && (sb.bundle as any).isActive
    );

    // Group by network
    const grouped: Record<string, typeof storeBundles> = {};
    for (const sb of storeBundles) {
        const net = (sb.bundle as any).network as string;
        if (!grouped[net]) grouped[net] = [];
        grouped[net].push(sb);
    }

    const networks = Object.keys(grouped);

    return (
        <div className="min-h-screen">
            <div className="max-w-2xl mx-auto px-4 pb-16 pt-8 md:pt-14">

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

                {/* Empty state */}
                {networks.length === 0 && (
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
                                            href={`/buy?network=${encodeURIComponent(network)}&bundle=${encodeURIComponent(bundle._id)}&ref=${agentId}`}
                                            className="block"
                                        >
                                            <div className={`relative rounded-2xl p-4 ${colors.bg} ${colors.text} shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-200 cursor-pointer`}>
                                                {/* Network badge */}
                                                <span className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${colors.badge}`}>
                                                    {network}
                                                </span>

                                                <Wifi size={20} className="opacity-70 mb-2" />
                                                <p className="font-extrabold text-xl leading-tight">{bundle.name}</p>
                                                <p className="font-semibold text-sm opacity-90 mt-0.5">{formatCurrency(displayPrice)}</p>
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
