"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search, Loader2, History, CheckCircle2, Clock, XCircle, ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

export default function TrackStoreOrder() {
    const { storename } = useParams();
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber || phoneNumber.length < 10) {
            alert("Please enter a valid phone number");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/store/track?phoneNumber=${encodeURIComponent(phoneNumber)}&storeSlug=${encodeURIComponent(storename as string)}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
                setHasSearched(true);
            } else {
                alert("Failed to fetch tracking info.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 pb-20">
            <button 
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 text-sm font-semibold mb-6 transition-colors"
            >
                <ChevronLeft size={16} /> Back to Store
            </button>

            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-orange-200">
                    <Search className="text-orange-600" size={28} />
                </div>
                <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Track Your Orders</h1>
                <p className="text-zinc-500 text-sm mt-1">Enter the phone number used for purchase</p>
            </div>

            <Card className="mb-8 border-0 shadow-lg shadow-zinc-200/50">
                <CardContent className="p-6">
                    <form onSubmit={handleTrack} className="flex gap-2">
                        <div className="relative flex-1">
                            <input 
                                type="tel" 
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="e.g. 024XXXXXXX"
                                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-lg font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-zinc-300 transition-all"
                                autoFocus
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading || phoneNumber.length < 10}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-orange-100 disabled:opacity-50 active:scale-95 flex items-center gap-2"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                            <span className="hidden sm:inline">Track</span>
                        </button>
                    </form>
                </CardContent>
            </Card>

            {hasSearched && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-lg font-bold text-zinc-800 flex items-center gap-2 px-1">
                        <History size={18} className="text-orange-500" />
                        Order History ({orders.length})
                    </h2>
                    
                    {orders.length === 0 ? (
                        <Card className="text-center py-12 border-dashed border-2 border-zinc-200">
                            <CardContent>
                                <p className="font-semibold text-zinc-500 text-sm">No orders found for this number.</p>
                                <p className="text-xs text-zinc-400 mt-1">Make sure you entered the correct number and that the purchase was made in this store.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        orders.map((order) => (
                            <Card key={order.transaction_id} className="border-0 shadow-sm hover:shadow-md transition-all">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm
                                            ${order.network === 'MTN' ? 'bg-yellow-400 text-[#51291e]' : 
                                              order.network === 'Telecel' ? 'bg-red-600 text-white' : 
                                              'bg-blue-700 text-white'}`}>
                                            {order.network[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-zinc-900 text-sm">{order.network} {order.bundleName}</h3>
                                            <p className="text-[10px] text-zinc-400 font-medium">
                                                {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-bold text-zinc-900 text-sm">{formatCurrency(order.price)}</p>
                                        <div className="flex items-center justify-end gap-1.5 mt-1">
                                            {order.status === 'delivered' && <CheckCircle2 size={12} className="text-green-600" />}
                                            {order.status === 'failed' && <XCircle size={12} className="text-red-500" />}
                                            {order.status === 'pending' && <Clock size={12} className="text-orange-500" />}
                                            <span className={`text-[10px] font-black uppercase tracking-wider
                                                ${order.status === 'delivered' ? 'text-green-600' : 
                                                  order.status === 'failed' ? 'text-red-500' : 
                                                  'text-orange-500'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
