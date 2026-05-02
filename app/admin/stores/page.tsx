"use client";
import { useState, useEffect } from "react";
import { Users, ShoppingBag, CreditCard, Plus, Trash2, Edit, Package, Search, ChevronRight, CheckCircle2, Shield, X, XCircle, Clock, UserPlus, Wallet, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import CopyButton from "@/components/ui/CopyButton";

export default function AdminStoresPage() {
    const [stats, setStats] = useState({ users: 0, orders: 0, sales: 0 });
    const [loading, setLoading] = useState(true);

    // Data States
    const [stores, setStores] = useState<any[]>([]);
    const [storeSearchQuery, setStoreSearchQuery] = useState('');

    // Shared dashboard state (to keep UI consistent with other pages)
    const [dakaziStats, setDakaziStats] = useState({ AccountBalance: { 'Wallet Balance': 0 } });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Stats
            const statsRes = await fetch('/api/admin/stats');
            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data);
            }

            // Fetch Stores
            const storesRes = await fetch('/api/admin/stores');
            if (storesRes.ok) {
                const data = await storesRes.json();
                setStores(data);
            }

            const dakaziRes = await fetch('/api/testingDakazi');
            if (dakaziRes.ok) {
                const data = await dakaziRes.json();
                setDakaziStats(data);
            }

        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center text-blue-600">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
            </div>
        );
    }

    const filteredStores = stores.filter(store =>
        (store.storeName?.toLowerCase() || '').includes(storeSearchQuery.toLowerCase()) ||
        (store.owner?.name?.toLowerCase() || '').includes(storeSearchQuery.toLowerCase()) ||
        (store.owner?.email?.toLowerCase() || '').includes(storeSearchQuery.toLowerCase()) ||
        (store.phoneNumber?.toLowerCase() || '').includes(storeSearchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Overview Stats (Consistent with other admin pages) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-zinc-200 hover:border-green-400 transition-colors bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                <CreditCard size={24} />
                            </div>
                        </div>
                        <p className="text-zinc-500 text-sm font-medium">Account Balance</p>
                        <h3 className="text-3xl font-bold mt-1 text-zinc-900">
                            {formatCurrency(Number(dakaziStats.AccountBalance?.['Wallet Balance'] || 0))}
                        </h3>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200 hover:border-green-400 transition-colors bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                <CreditCard size={24} />
                            </div>
                        </div>
                        <p className="text-zinc-500 text-sm font-medium">Total Sales</p>
                        <h3 className="text-3xl font-bold mt-1 text-zinc-900">{formatCurrency(stats.sales)}</h3>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200 hover:border-purple-400 transition-colors bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                                <ShoppingBag size={24} />
                            </div>
                        </div>
                        <p className="text-zinc-500 text-sm font-medium">Total Orders</p>
                        <h3 className="text-3xl font-bold mt-1 text-zinc-900">{stats.orders}</h3>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200 hover:border-blue-400 transition-colors bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                <Users size={24} />
                            </div>
                        </div>
                        <p className="text-zinc-500 text-sm font-medium">Total Users</p>
                        <h3 className="text-3xl font-bold mt-1 text-zinc-900">{stats.users}</h3>
                    </CardContent>
                </Card>
            </div>

            {/* Stores List */}
            <Card className="border-zinc-200 bg-white overflow-hidden">
                <div className="p-4 md:p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white">
                    <h3 className="text-lg font-semibold text-zinc-900">Active Stores</h3>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search stores..."
                            value={storeSearchQuery}
                            onChange={(e) => setStoreSearchQuery(e.target.value)}
                            className="bg-zinc-50 border border-zinc-200 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-900 focus:outline-none focus:border-blue-500 transition-colors w-full placeholder-zinc-400"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 text-zinc-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Store Name</th>
                                <th className="px-6 py-4">Owner</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4">Total Sales</th>
                                <th className="px-6 py-4">Total Profit</th>
                                <th className="px-6 py-4">Orders</th>
                                <th className="px-6 py-4">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredStores.map((store) => (
                                <tr key={store._id} className="hover:bg-zinc-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-zinc-900">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                                <Store size={16} />
                                            </div>
                                            {store.storeName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-zinc-900">{store.owner?.name || 'Unknown'}</span>
                                            <span className="text-xs text-zinc-500">{store.owner?.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600">{store.phoneNumber}</td>
                                    <td className="px-6 py-4 font-semibold text-zinc-900">
                                        {formatCurrency(store.totalSales)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                                            {formatCurrency(store.totalProfit)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600 font-medium">{store.orderCount}</td>
                                    <td className="px-6 py-4 text-zinc-500 text-xs">
                                        {new Date(store.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {filteredStores.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                                        <ShoppingBag size={32} className="mx-auto mb-2 opacity-30 text-zinc-400" />
                                        <p>No stores found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
