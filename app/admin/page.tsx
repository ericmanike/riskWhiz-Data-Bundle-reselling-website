"use client";

import { useState, useEffect } from "react";
import { Users, ShoppingBag, CreditCard, Plus, Trash2, Edit, Package, Search, ChevronRight, CheckCircle2, Shield, X, XCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboard() {
    const [stats, setStats] = useState({ users: 0, orders: 0, sales: 0 });
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'users' | 'bundles'>('overview');
    const [loading, setLoading] = useState(true);

    // Data States
    const [users, setUsers] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [bundles, setBundles] = useState<any[]>([]);

    // Modal & Form State
    const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
    const [editingBundle, setEditingBundle] = useState<any>(null);
    const [bundleForm, setBundleForm] = useState({
        network: 'MTN',
        name: '',
        price: '',
        isActive: true
    });

    //dakazi states
    const [dakaziStats, setDakaziStats] = useState({ AccountBalance: { 'Wallet Balance': 0 }, mtndata: [], teleceldata: [], airteltigodata: [] });









    const [submitting, setSubmitting] = useState(false);

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


            const dakaziRes = await fetch('/api/testingDakazi');
            if (dakaziRes.ok) {
                const data = await dakaziRes.json();
                setDakaziStats(data);
            }

            // Fetch Bundles
            const bundlesRes = await fetch('/api/bundles');
            if (bundlesRes.ok) setBundles(await bundlesRes.json());

            // Load extra data if authenticated
            loadTabSpecificData('orders'); // Preload or load lazy
            loadTabSpecificData('users');

        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const loadTabSpecificData = async (tab: string) => {
        try {
            if (tab === 'orders') {
                const res = await fetch('/api/admin/orders');
                if (res.ok) setOrders(await res.json());
            }
            if (tab === 'users') {
                const res = await fetch('/api/admin/users');
                if (res.ok) setUsers(await res.json());
            }
        } catch (e) {
            console.error(e);
        }
    }

    // Effect to lazy load data when tab changes if needed (already preloaded above for simplicity)
    useEffect(() => {

        console.log(dakaziStats);

    }, [dakaziStats]);

    const handleSaveBundle = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingBundle ? `/api/bundles/${editingBundle._id}` : '/api/bundles';
            const method = editingBundle ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...bundleForm,
                    price: parseFloat(bundleForm.price)
                })
            });

            if (res.ok) {
                const savedBundle = await res.json();
                if (editingBundle) {
                    // Update existing bundle
                    setBundles(bundles.map(b => b._id === savedBundle._id ? savedBundle : b));
                } else {
                    // Add new bundle
                    setBundles([...bundles, savedBundle]);
                }
                closeModal();
            } else {
                alert(editingBundle ? 'Failed to update bundle' : 'Failed to add bundle');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving bundle');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to delete this order?')) return;

        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setOrders(orders.filter(o => o._id !== orderId));
            } else {
                alert('Failed to delete order');
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting order');
        }
    };

    const handleDeleteBundle = async (bundleId: string) => {
        if (!confirm('Are you sure you want to delete this bundle?')) return;

        try {
            const res = await fetch(`/api/bundles/${bundleId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setBundles(bundles.filter(b => b._id !== bundleId));
            } else {
                alert('Failed to delete bundle');
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting bundle');
        }
    };

    const openEditModal = (bundle: any) => {
        setEditingBundle(bundle);
        setBundleForm({
            network: bundle.network,
            name: bundle.name,
            price: bundle.price.toString(),
            isActive: bundle.isActive
        });
        setIsBundleModalOpen(true);
    };

    const openAddModal = () => {
        setEditingBundle(null);
        setBundleForm({ network: 'MTN', name: '', price: '', isActive: true });
        setIsBundleModalOpen(true);
    };

    const closeModal = () => {
        setIsBundleModalOpen(false);
        setEditingBundle(null);
        setBundleForm({ network: 'MTN', name: '', price: '', isActive: true });
    };




    if (loading && !stats.users) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-blue-600">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 p-2 sm:p-4 md:p-8 pt-24 pb-24 md:pb-8 relative overflow-y-auto">

            {/* Modal Overlay */}
            {isBundleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-zinc-100">
                            <h3 className="text-lg font-bold text-zinc-900">
                                {editingBundle ? 'Edit Bundle' : 'Add New Bundle'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveBundle} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Network</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={bundleForm.network}
                                    onChange={(e) => setBundleForm({ ...bundleForm, network: e.target.value })}
                                >
                                    <option value="MTN">MTN</option>
                                    <option value="Telecel">Telecel</option>
                                    <option value="AirtelTigo">AirtelTigo</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Bundle Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 1GB"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={bundleForm.name}
                                    onChange={(e) => setBundleForm({ ...bundleForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Price (GHS)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 
                                    focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={bundleForm.price}
                                    onChange={(e) => setBundleForm({ ...bundleForm, price: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                    checked={bundleForm.isActive}
                                    onChange={(e) => setBundleForm({ ...bundleForm, isActive: e.target.checked })}
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-zinc-700">Active Status</label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (editingBundle ? 'Updating...' : 'Adding...') : (editingBundle ? 'Update Bundle' : 'Add Bundle')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                        {[
                            { id: 'overview', label: 'Stats', icon: CheckCircle2 },
                            { id: 'orders', label: 'Orders', icon: ShoppingBag },
                            { id: 'users', label: 'Users', icon: Users },
                            { id: 'bundles', label: 'Bundles', icon: Package },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-all relative
                                    ${activeTab === tab.id ? 'text-blue-600' : 'text-zinc-500 hover:text-zinc-900'}
                                `}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="space-y-6">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">



                                <Card className="border-zinc-200 hover:border-green-400 transition-colors bg-white">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                                <CreditCard size={24} />
                                            </div>

                                        </div>
                                        <p className="text-zinc-500 text-sm font-medium">Account Balance</p>
                                        <h3 className="text-3xl font-bold mt-1 text-zinc-900">{formatCurrency(dakaziStats.AccountBalance['Wallet Balance'])}</h3>
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
                                    <CardContent className="p-3">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                                                <ShoppingBag size={24} />
                                            </div>


                                        </div>
                                        <p className="text-zinc-500 text-sm font-medium">Total Orders</p>
                                        <h3 className="text-3xl font-bold mt-1 text-zinc-900">{stats.orders}</h3>
                                    </CardContent>
                                </Card>


                                <Card className=" bg-black border-zinc-200 hover:border-blue-400 transition-colors bg-white">
                                    <CardContent className="p-3">
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
                        </>
                    )}

                    {/* ORDERS TAB */}
                    {activeTab === 'orders' && (
                        <Card className="border-zinc-200 bg-white overflow-hidden">
                            <div className="p-4 md:p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white">
                                <h3 className="text-lg font-semibold text-zinc-900">Recent Orders</h3>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search orders..."
                                        className="bg-zinc-50 border border-zinc-200 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-900 focus:outline-none focus:border-blue-500 transition-colors w-full placeholder-zinc-400"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-zinc-50 text-zinc-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Order ID</th>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Bundle</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {orders.map((order) => (
                                            <tr key={order._id} className="hover:bg-zinc-50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-zinc-500">#{order._id.slice(-6)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-zinc-900">{order.user?.name || 'Unknown'}</span>
                                                        <span className="text-xs text-zinc-500">{order.phoneNumber}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium 
                                                        ${order.network === 'MTN' ? 'bg-yellow-100 text-yellow-800' :
                                                            order.network === 'Telecel' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                        {order.network} {order.bundleName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-zinc-700">{formatCurrency(order.price)}</td>
                                                <td className="px-6 py-4 text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                                                        ${order.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                                                            order.status === 'failed' ? 'bg-red-100 text-red-700 border-red-200' :
                                                                'bg-orange-100 text-orange-700 border-orange-200'}`}>
                                                        {order.status === 'completed' && <CheckCircle2 size={12} />}
                                                        {order.status === 'failed' && <XCircle size={12} />}
                                                        {order.status === 'pending' && <Clock size={12} />}
                                                        <span className="capitalize">{order.status}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteOrder(order._id)}
                                                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete order"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {orders.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                                                    <ShoppingBag size={32} className="mx-auto mb-2 opacity-30 text-zinc-400" />
                                                    <p>No orders found</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <Card className="border-zinc-200 bg-white overflow-hidden">
                            <div className="p-4 md:p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white">
                                <h3 className="text-lg font-semibold text-zinc-900">Registered Users</h3>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        className="bg-zinc-50 border border-zinc-200 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-900 focus:outline-none focus:border-blue-500 transition-colors w-full placeholder-zinc-400"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-zinc-50 text-zinc-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Joined</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {users.map((user) => (
                                            <tr key={user._id} className="hover:bg-zinc-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-zinc-900">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-200">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        {user.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-zinc-500">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase
                                                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-zinc-100 text-zinc-600'}
                                                    `}>{user.role}</span>
                                                </td>
                                                <td className="px-6 py-4 text-zinc-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-zinc-400 hover:text-zinc-600 transition-colors">
                                                        <Edit size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                                    <Users size={32} className="mx-auto mb-2 opacity-30 text-zinc-400" />
                                                    <p>No users found</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {/* BUNDLES TAB */}
                    {activeTab === 'bundles' && (
                        <div className="space-y-6 px-2 sm:px-0">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <h2 className="text-xl font-semibold text-zinc-900">Data Bundles</h2>
                                <button
                                    onClick={openAddModal}
                                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 w-full sm:w-auto"
                                >
                                    <Plus size={16} /> Add Bundle
                                </button>
                            </div>

                            <Card className="border-zinc-200 bg-white overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-blue-50 text-blue-800">
                                            <tr>
                                                <th className="px-6 py-4 font-medium">Network</th>
                                                <th className="px-6 py-4 font-medium">Bundle Name</th>
                                                <th className="px-6 py-4 font-medium">Price (GHS)</th>
                                                <th className="px-6 py-4 font-medium">Status</th>
                                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100">
                                            {bundles.map((bundle) => (
                                                <tr key={bundle._id} className="hover:bg-zinc-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium">
                                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase w-16 text-center
                                                            ${bundle.network === 'MTN' ? 'bg-yellow-100 text-yellow-800' :
                                                                bundle.network === 'Telecel' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                            {bundle.network}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-zinc-900 font-medium">{bundle.name}</td>
                                                    <td className="px-6 py-4 text-zinc-600">{formatCurrency(bundle.price)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                                            ${bundle.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {bundle.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2 justify-end">
                                                            <button
                                                                onClick={() => openEditModal(bundle)}
                                                                className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                title="Edit bundle"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteBundle(bundle._id)}
                                                                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                title="Delete bundle"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {bundles.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                                        <Package size={32} className="mx-auto mb-2 opacity-30 text-zinc-400" />
                                                        <p>No bundles found</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
