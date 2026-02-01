"use client";
import { useState, useEffect } from "react";
import { Users, ShoppingBag, CreditCard, Plus, Trash2, Edit, Package, Search, ChevronRight, CheckCircle2, Shield, X, XCircle, Clock, UserPlus, Wallet } from "lucide-react";
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
        isActive: true,
        audience: 'user'
    });

    //dakazi states
    const [dakaziStats, setDakaziStats] = useState({ AccountBalance: { 'Wallet Balance': 0 }, mtndata: [], teleceldata: [], airteltigodata: [] });









    const [submitting, setSubmitting] = useState(false);
    const [bundleFilter, setBundleFilter] = useState<'all' | 'user' | 'agent'>('all');

    // Top-up modal state
    const [topUpModalOpen, setTopUpModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [topUpAmount, setTopUpAmount] = useState('');

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
            isActive: bundle.isActive,
            audience: bundle.audience || 'user'
        });
        setIsBundleModalOpen(true);
    };

    const openAddModal = () => {
        setEditingBundle(null);
        setBundleForm({ network: 'MTN', name: '', price: '', isActive: true, audience: 'user' });
        setIsBundleModalOpen(true);
    };

    const closeModal = () => {
        setIsBundleModalOpen(false);
        setEditingBundle(null);
        setBundleForm({ network: 'MTN', name: '', price: '', isActive: true, audience: 'user' });
    };

    const handleMakeAgent = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to promote ${userName} to agent?`)) return;

        try {
            const res = await fetch('/api/makeAgent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            const data = await res.json();

            if (res.ok) {
                // Update the user in the local state
                setUsers(users.map(u =>
                    u._id === userId ? { ...u, role: 'agent' } : u
                ));
                alert(`${userName} has been promoted to agent!`);
            } else {
                alert(data.message || 'Failed to promote user to agent');
            }
        } catch (error) {
            console.error(error);
            alert('Error promoting user to agent');
        }
    };

    const handleTopUpUser = async () => {
        if (!selectedUser || !topUpAmount) {
            alert('Please enter an amount');
            return;
        }

        const amount = parseFloat(topUpAmount);
        if (amount <= 0) {
            alert('Amount must be greater than 0');
            return;
        }

        try {
            const res = await fetch('/api/adminTopUp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedUser._id,
                    amount
                })
            });

            const data = await res.json();

            if (res.ok) {
                // Update the user in the local state
                setUsers(users.map(u =>
                    u._id === selectedUser._id ? { ...u, walletBalance: data.user.walletBalance } : u
                ));
                alert(`Successfully added ${formatCurrency(amount)} to ${selectedUser.name}'s wallet!`);
                setTopUpModalOpen(false);
                setSelectedUser(null);
                setTopUpAmount('');
            } else {
                alert(data.message || 'Failed to top up user balance');
            }
        } catch (error) {
            console.error(error);
            alert('Error topping up user balance');
        }
    };

    const openTopUpModal = (user: any) => {
        setSelectedUser(user);
        setTopUpModalOpen(true);
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
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Target Audience</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={bundleForm.audience}
                                    onChange={(e) => setBundleForm({ ...bundleForm, audience: e.target.value })}
                                >
                                    <option value="user">Regular User</option>
                                    <option value="agent">Agent / Reseller</option>
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
                                    <thead className="bg-zinc-50 text-zinc-500 font-medium whitespace-nowrap">
                                        <tr>
                                            <th className="px-6 py-4 border-b">Order ID</th>
                                            <th className="px-6 py-4 border-b">User</th>
                                            <th className="px-6 py-4 border-b">Bundle</th>
                                            <th className="px-6 py-4 border-b">Amount</th>
                                            <th className="px-6 py-4 border-b">Date</th>
                                            <th className="px-6 py-4 border-b">Status</th>
                                            <th className="px-6 py-4 border-b text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 whitespace-nowrap">
                                        {orders.map((order) => (
                                            <tr key={order._id} className="hover:bg-zinc-50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-zinc-500">#{order.transaction_id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-zinc-900">{order.user?.name || 'Unknown'}</span>
                                                        <span className="text-xs text-zinc-500">{order.phoneNumber}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium 
                                                        ${order.network === 'MTN' ? 'bg-yellow-500 text-brown-500' :
                                                            order.network === 'Telecel' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}>
                                                        {order.network} {order.bundleName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-zinc-700">{formatCurrency(order.price)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-zinc-600">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                        <span className="text-[10px] text-zinc-400 font-medium">
                                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                                                        ${order.status === 'delivered' ? 'bg-green-600 text-white border-green-700' :
                                                            order.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                                                                order.status === 'failed' ? 'bg-red-100 text-red-700 border-red-200' :
                                                                    'bg-orange-100 text-orange-700 border-orange-200'}`}>
                                                        {order.status === 'delivered' && <CheckCircle2 size={12} />}
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

                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-zinc-50 text-zinc-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Wallet Balance</th>
                                            <th className="px-6 py-4">Joined</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {users.map((user) => (
                                            <tr key={user._id} className="hover:bg-zinc-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-zinc-900">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        {user.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-zinc-500">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase
                                                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                            user.role === 'agent' ? 'bg-green-100 text-green-700' :
                                                                'bg-zinc-100 text-zinc-600'}
                                                    `}>{user.role}</span>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-zinc-900">
                                                    {formatCurrency(user.walletBalance || 0)}
                                                </td>
                                                <td className="px-6 py-4 text-zinc-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex gap-2 justify-end flex-wrap">
                                                        {user.role === 'user' && (
                                                            <button
                                                                onClick={() => handleMakeAgent(user._id, user.name)}
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 text-green-600 hover:text-white hover:bg-green-600 border border-green-600 rounded-lg transition-all text-sm font-medium"
                                                                title="Promote to agent"
                                                            >
                                                                <UserPlus size={16} />
                                                                Promote to Agent
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => openTopUpModal(user)}
                                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 rounded-lg transition-all text-sm font-medium"
                                                            title="Top up balance"
                                                        >
                                                            <Wallet size={16} />
                                                            Top Up Balance
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                                    <Users size={32} className="mx-auto mb-2 opacity-30 text-zinc-400" />
                                                    <p>No users found</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4 p-4">
                                {users.map((user) => (
                                    <div key={user._id} className="bg-white border border-zinc-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-zinc-900">{user.name}</p>
                                                    <p className="text-xs text-zinc-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium uppercase
                                                ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                    user.role === 'agent' ? 'bg-green-100 text-green-700' :
                                                        'bg-zinc-100 text-zinc-600'}
                                            `}>{user.role}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                                            <div>
                                                <p className="text-zinc-500 text-xs">Wallet Balance</p>
                                                <p className="font-semibold text-zinc-900">{formatCurrency(user.walletBalance || 0)}</p>
                                            </div>
                                            <div>
                                                <p className="text-zinc-500 text-xs">Joined</p>
                                                <p className="text-zinc-700">{new Date(user.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 pt-3 border-t border-zinc-100">
                                            {user.role === 'user' && (
                                                <button
                                                    onClick={() => handleMakeAgent(user._id, user.name)}
                                                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-green-600 hover:text-white hover:bg-green-600 border border-green-600 rounded-lg transition-all text-sm font-medium"
                                                >
                                                    <UserPlus size={16} />
                                                    Promote to Agent
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openTopUpModal(user)}
                                                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 rounded-lg transition-all text-sm font-medium"
                                            >
                                                <Wallet size={16} />
                                                Top Up Balance
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {users.length === 0 && (
                                    <div className="py-12 text-center text-zinc-500">
                                        <Users size={32} className="mx-auto mb-2 opacity-30 text-zinc-400" />
                                        <p>No users found</p>
                                    </div>
                                )}
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

                            {/* Filter Buttons */}
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setBundleFilter('all')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${bundleFilter === 'all'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-white text-zinc-600 border border-zinc-200 hover:border-blue-300'
                                        }`}
                                >
                                    All Bundles
                                </button>
                                <button
                                    onClick={() => setBundleFilter('user')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${bundleFilter === 'user'
                                        ? 'bg-gray-600 text-white shadow-md'
                                        : 'bg-white text-zinc-600 border border-zinc-200 hover:border-gray-300'
                                        }`}
                                >
                                    User Bundles
                                </button>
                                <button
                                    onClick={() => setBundleFilter('agent')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${bundleFilter === 'agent'
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'bg-white text-zinc-600 border border-zinc-200 hover:border-green-300'
                                        }`}
                                >
                                    Agent Bundles
                                </button>
                            </div>

                            <Card className="border-zinc-200 bg-white overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-blue-50 text-blue-800 whitespace-nowrap">
                                            <tr>
                                                <th className="px-6 py-4 font-medium border-b">Network</th>
                                                <th className="px-6 py-4 font-medium border-b">Bundle Name</th>
                                                <th className="px-6 py-4 font-medium border-b">Price (GHS)</th>
                                                <th className="px-6 py-4 font-medium border-b">Status</th>
                                                <th className="px-6 py-4 font-medium border-b">Audience</th>
                                                <th className="px-6 py-4 font-medium border-b text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 whitespace-nowrap">
                                            {bundles
                                                .filter(bundle => {
                                                    if (bundleFilter === 'all') return true;
                                                    return bundle.audience === bundleFilter;
                                                })
                                                .map((bundle) => (
                                                    <tr key={bundle._id} className="hover:bg-zinc-50 transition-colors">
                                                        <td className="px-6 py-4 font-medium">
                                                            <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold uppercase min-w-[70px] text-center
                                                            ${bundle.network === 'MTN' ? 'bg-yellow-500 text-brown-500' :
                                                                    bundle.network === 'Telecel' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}>
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
                                                            <span className={`px-2 py-1 rounded-md text-xs font-medium border
                                                            ${bundle.audience === 'agent' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                                {bundle.audience === 'agent' ? 'Agent' : 'User'}
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
                                            {bundles.filter(bundle => {
                                                if (bundleFilter === 'all') return true;
                                                return bundle.audience === bundleFilter;
                                            }).length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                                            <Package size={32} className="mx-auto mb-2 opacity-30 text-zinc-400" />
                                                            <p>No {bundleFilter !== 'all' ? bundleFilter : ''} bundles found</p>
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
            </div >

            {/* Top Up Modal */}
            {
                topUpModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-zinc-900">Top Up User Balance</h3>
                                <button
                                    onClick={() => {
                                        setTopUpModalOpen(false);
                                        setSelectedUser(null);
                                        setTopUpAmount('');
                                    }}
                                    className="text-zinc-400 hover:text-zinc-600 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {selectedUser && (
                                <div className="space-y-4">
                                    <div className="bg-zinc-50 p-4 rounded-lg">
                                        <p className="text-sm text-zinc-500 mb-1">User</p>
                                        <p className="font-semibold text-zinc-900">{selectedUser.name}</p>
                                        <p className="text-sm text-zinc-500">{selectedUser.email}</p>
                                        <p className="text-sm text-zinc-600 mt-2">
                                            Current Balance: <span className="font-bold text-blue-600">{formatCurrency(selectedUser.walletBalance || 0)}</span>
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">
                                            Amount to Add (GHS)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={topUpAmount}
                                            onChange={(e) => setTopUpAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>

                                    {topUpAmount && parseFloat(topUpAmount) > 0 && (
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-blue-600">
                                                New Balance: <span className="font-bold">{formatCurrency((selectedUser.walletBalance || 0) + parseFloat(topUpAmount))}</span>
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => {
                                                setTopUpModalOpen(false);
                                                setSelectedUser(null);
                                                setTopUpAmount('');
                                            }}
                                            className="flex-1 px-4 py-3 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleTopUpUser}
                                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                        >
                                            Confirm Top Up
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
}
