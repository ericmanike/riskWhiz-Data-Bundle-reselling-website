"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { ChevronRight, Loader2 } from "lucide-react";
import clsx from "clsx";

const NETWORKS = [
    { id: "MTN", name: "MTN", color: "bg-yellow-400", textColor: "text-yellow-900" },
    { id: "Telecel", name: "Telecel", color: "bg-red-500", textColor: "text-white" },
    { id: "AirtelTigo", name: "AirtelTigo", color: "bg-blue-600", textColor: "text-white" },
];

const MOCK_BUNDLES = [
    { id: "1", name: "1GB", price: 10 },
    { id: "2", name: "2GB", price: 18 },
    { id: "3", name: "5GB", price: 40 },
    { id: "4", name: "10GB", price: 75 },
];

export default function BuyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialNetwork = searchParams.get("network");

    const [step, setStep] = useState(1);
    const [selectedNetwork, setSelectedNetwork] = useState(initialNetwork || "");
    const [selectedBundle, setSelectedBundle] = useState<any>(null);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePurchase = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    network: selectedNetwork,
                    bundleName: selectedBundle.name,
                    price: selectedBundle.price,
                    phoneNumber,
                }),
            });

            if (!res.ok) throw new Error("Purchase failed");

            router.push("/history");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Something went wrong with the purchase.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto min-h-screen md:pt-35 pt-24 z-0">
            <h1 className="text-2xl font-bold mb-6">Buy Data Bundle</h1>

            {/* Step 1: Select Network */}
            {step === 1 && (
                <div className="space-y-4">
                    <p className="text-sm font-medium text-zinc-500 mb-2">Select Network</p>
                    <div className="grid grid-cols-1 gap-3">
                        {NETWORKS.map((net) => (
                            <button
                                key={net.id}
                                onClick={() => {
                                    setSelectedNetwork(net.id);
                                    setStep(2);
                                }}
                                className={clsx(
                                    "flex items-center justify-between p-4 rounded-xl border transition-all",
                                    "hover:shadow-md",
                                    selectedNetwork === net.id
                                        ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20"
                                        : "bg-white text-zinc-900 border-zinc-200 hover:border-blue-300"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm", net.color, net.textColor)}>
                                        {net.name[0]}
                                    </div>
                                    <span className="font-semibold">{net.name}</span>
                                </div>
                                <ChevronRight size={20} className={selectedNetwork === net.id ? "text-white" : "text-zinc-400"} />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Select Bundle */}
            {step === 2 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => setStep(1)} className="text-sm text-zinc-500 hover:text-zinc-900">
                            Change Network
                        </button>
                        <span className="text-zinc-300">/</span>
                        <span className="text-sm font-semibold">{selectedNetwork}</span>
                    </div>

                    <p className="text-sm font-medium text-zinc-500">Select Bundle Size</p>
                    <div className="grid grid-cols-2 gap-3">
                        {MOCK_BUNDLES.map((bundle) => (
                            <button
                                key={bundle.id}
                                onClick={() => {
                                    setSelectedBundle(bundle);
                                    setStep(3);
                                }}
                                className={clsx(
                                    "p-4 rounded-xl border transition-all text-left",
                                    "hover:shadow-md",
                                    "bg-white border-zinc-200 hover:border-blue-500"
                                )}
                            >
                                <h3 className="text-lg font-bold mb-1 text-zinc-900">{bundle.name}</h3>
                                <p className="text-blue-600 font-medium">GHS {bundle.price.toFixed(2)}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Enter Number & Confirm */}
            {step === 3 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => setStep(2)} className="text-sm text-zinc-500 hover:text-zinc-900">
                            Change Package
                        </button>
                        <span className="text-zinc-300">/</span>
                        <span className="text-sm font-semibold">{selectedBundle.name}</span>
                    </div>

                    <Card>
                        <CardContent className="p-6">
                            <div className="mb-6">
                                <label className="text-sm font-medium text-black mb-2 block">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-900 bg-white text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white text-lg tracking-wide"
                                    placeholder="024 XXX XXXX"
                                    autoFocus
                                />
                            </div>

                            <div className="bg-blue-700 p-4 rounded-xl space-y-2 mb-6 border border-blue-500">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white">Network</span>
                                    <span className="font-semibold text-white">{selectedNetwork}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white">Package</span>
                                    <span className="font-semibold text-white">{selectedBundle.name}</span>
                                </div>
                                <div className="border-t border-blue-500 my-2 pt-2 flex justify-between items-center">
                                    <span className="text-white">Total Price</span>
                                    <span className="text-xl font-bold text-white">GHS {selectedBundle.price.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePurchase}
                                disabled={loading || phoneNumber.length < 10}
                                className="w-full py-3.5 text-white hover:bg-blue-700 bg-blue-600 rounded-xl font-semibold transition-all flex items-center justify-center
                                 gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg
                                 cursor-pointer"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Confirm Purchase"}
                            </button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
