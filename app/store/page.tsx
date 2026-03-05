'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Store, Share2, ShoppingBag, TrendingUp, Link2, Plus, Trash2,
    Pencil, Check, X, Loader2, Wifi, ChevronDown, ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

type Bundle = {
    _id: string;
    name: string;
    network: string;
    price: number;
    isActive: boolean;
    audience: string;
};

type StoreBundle = {
    _id: string;
    bundle: Bundle;
    customPrice?: number;
    isVisible: boolean;
};

const NETWORK_COLORS: Record<string, { bg: string; text: string; ring: string; input: string; dot: string }> = {
    MTN: {
        bg: 'bg-yellow-400', text: 'text-[#51291e]', ring: 'ring-yellow-400',
        input: 'bg-yellow-300 border-yellow-500 text-[#51291e] placeholder-yellow-700/50',
        dot: 'bg-yellow-400',
    },
    Telecel: {
        bg: 'bg-red-600', text: 'text-white', ring: 'ring-red-500',
        input: 'bg-red-500 border-red-300 text-white placeholder-red-200',
        dot: 'bg-red-500',
    },
    AirtelTigo: {
        bg: 'bg-blue-700', text: 'text-white', ring: 'ring-blue-600',
        input: 'bg-blue-600 border-blue-400 text-white placeholder-blue-300',
        dot: 'bg-blue-600',
    },
};

export default function StoreManagementPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    /* ── store name ── */
    const [storeName, setStoreName] = useState('');
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [savingName, setSavingName] = useState(false);

    /* ── data ── */
    const [storeBundles, setStoreBundles] = useState<StoreBundle[]>([]);
    const [allBundles, setAllBundles] = useState<Bundle[]>([]);
    const [loadingStore, setLoadingStore] = useState(true);
    const [loadingAll, setLoadingAll] = useState(false);

    /* ── add-panel UI ── */
    const [showAddPanel, setShowAddPanel] = useState(false);
    // per-bundle price input in the picker: bundleId → price string
    const [pickPrices, setPickPrices] = useState<Record<string, string>>({});
    const [adding, setAdding] = useState<string | null>(null);
    const [removing, setRemoving] = useState<string | null>(null);

    /* ── inline price edit on store cards ── */
    const [editingPrice, setEditingPrice] = useState<string | null>(null);
    const [priceInput, setPriceInput] = useState('');
    const [savingPrice, setSavingPrice] = useState<string | null>(null);

    /* ── stats ── */
    const [totalSales, setTotalSales] = useState(0);
    const [revenue, setRevenue] = useState(0);

    const storeLink =
        typeof window !== 'undefined'
            ? `${window.location.origin}/store/${session?.user?.id}`
            : '';

    useEffect(() => {
        if (status === 'loading') return;
        if (!session || session.user.role !== 'agent') router.replace('/dashboard');
    }, [session, status, router]);

    const loadStoreBundles = useCallback(async () => {
        setLoadingStore(true);
        try {
            const res = await fetch('/api/store/bundles');
            if (res.ok) setStoreBundles(await res.json());
        } finally {
            setLoadingStore(false);
        }
    }, []);

    useEffect(() => {
        if (!session) return;
        fetch('/api/store/stats')
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d) {
                    setTotalSales(d.totalSales ?? 0);
                    setRevenue(d.revenue ?? 0);
                    setStoreName(d.storeName ?? '');
                    setNameInput(d.storeName ?? '');
                }
            }).catch(() => null);
        loadStoreBundles();
    }, [session, loadStoreBundles]);

    const loadAllBundles = async () => {
        setLoadingAll(true);
        try {
            const res = await fetch('/api/bundles');
            if (res.ok) {
                const data: Bundle[] = await res.json();
                // Show ALL active bundles from admin
                setAllBundles(data.filter(b => b.isActive));
            }
        } finally {
            setLoadingAll(false);
        }
    };

    const handleShowAdd = () => {
        const next = !showAddPanel;
        setShowAddPanel(next);
        if (next && allBundles.length === 0) loadAllBundles();
    };

    /* ── Add bundle with custom price ── */
    const addBundle = async (bundle: Bundle) => {
        const rawPrice = pickPrices[bundle._id];
        const customPrice = rawPrice ? parseFloat(rawPrice) : undefined;
        if (rawPrice && (isNaN(customPrice!) || customPrice! <= 0)) {
            alert('Please enter a valid price');
            return;
        }
        setAdding(bundle._id);
        try {
            const res = await fetch('/api/store/bundles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bundleId: bundle._id, customPrice }),
            });
            if (res.ok) {
                await loadStoreBundles();
                // clear the price input for this bundle
                setPickPrices(prev => { const n = { ...prev }; delete n[bundle._id]; return n; });
            }
        } finally {
            setAdding(null);
        }
    };

    /* ── Remove ── */
    const removeBundle = async (storeBundleId: string) => {
        setRemoving(storeBundleId);
        try {
            const res = await fetch(`/api/store/bundles/${storeBundleId}`, { method: 'DELETE' });
            if (res.ok) setStoreBundles(prev => prev.filter(sb => sb._id !== storeBundleId));
        } finally {
            setRemoving(null);
        }
    };

    /* ── Inline price edit on store cards ── */
    const startEditPrice = (sb: StoreBundle) => {
        setEditingPrice(sb._id);
        setPriceInput(String(sb.customPrice ?? sb.bundle?.price ?? ''));
    };
    const cancelEditPrice = () => { setEditingPrice(null); setPriceInput(''); };

    const savePrice = async (storeBundleId: string) => {
        const price = parseFloat(priceInput);
        if (isNaN(price) || price <= 0) return;
        setSavingPrice(storeBundleId);
        try {
            const res = await fetch(`/api/store/bundles/${storeBundleId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customPrice: price }),
            });
            if (res.ok) {
                setStoreBundles(prev => prev.map(sb => sb._id === storeBundleId ? { ...sb, customPrice: price } : sb));
                setEditingPrice(null);
            }
        } finally { setSavingPrice(null); }
    };

    const resetPrice = async (storeBundleId: string) => {
        setSavingPrice(storeBundleId);
        try {
            const res = await fetch(`/api/store/bundles/${storeBundleId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customPrice: null }),
            });
            if (res.ok) {
                setStoreBundles(prev => prev.map(sb => sb._id === storeBundleId ? { ...sb, customPrice: undefined } : sb));
                setEditingPrice(null);
            }
        } finally { setSavingPrice(null); }
    };

    const saveStoreName = async () => {
        if (!nameInput.trim() || nameInput.trim().length < 2) return;
        setSavingName(true);
        try {
            const res = await fetch('/api/store/name', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeName: nameInput.trim() }),
            });
            if (res.ok) { setStoreName(nameInput.trim()); setEditingName(false); }
        } finally { setSavingName(false); }
    };

    const copyLink = () => navigator.clipboard.writeText(storeLink);

    /* ── derived ── */
    const addedBundleIds = new Set(storeBundles.map(sb => sb.bundle?._id));
    const grouped: Record<string, StoreBundle[]> = {};
    for (const sb of storeBundles) {
        if (!sb.bundle) continue;
        const net = sb.bundle.network;
        if (!grouped[net]) grouped[net] = [];
        grouped[net].push(sb);
    }

    // Group all-bundles by network for the picker
    const allGrouped: Record<string, Bundle[]> = {};
    for (const b of allBundles) {
        if (!allGrouped[b.network]) allGrouped[b.network] = [];
        allGrouped[b.network].push(b);
    }

    if (status === 'loading' || !session) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6 max-w-4xl mx-auto md:pt-28 pt-24 pb-16">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-200 shrink-0">
                        <Store size={24} className="text-white" />
                    </div>
                    <div>
                        {editingName ? (
                            <div className="flex items-center gap-2">
                                <input value={nameInput} onChange={e => setNameInput(e.target.value)}
                                    className="border border-orange-300 rounded-lg px-2 py-1 text-lg font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-400 w-44"
                                    autoFocus maxLength={40} />
                                <button onClick={saveStoreName} disabled={savingName}
                                    className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 disabled:opacity-50">
                                    {savingName ? <Loader2 size={12} className="animate-spin" /> : <Check size={13} />}
                                </button>
                                <button onClick={() => { setEditingName(false); setNameInput(storeName); }}
                                    className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center hover:bg-zinc-300">
                                    <X size={13} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-zinc-900">{storeName || 'My Store'}</h1>
                                <button onClick={() => { setEditingName(true); setNameInput(storeName); }}
                                    className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-orange-100 text-zinc-400 hover:text-orange-500 transition-colors">
                                    <Pencil size={11} />
                                </button>
                            </div>
                        )}
                        <p className="text-zinc-500 text-sm">Manage your store &amp; bundles</p>
                    </div>
                </div>
                <a href={`/store/${session.user.id}`} target="_blank"
                    className="shrink-0 text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors">
                    Preview ↗
                </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <ShoppingBag size={14} className="text-orange-500" />
                            <span className="text-xs text-zinc-500 font-medium">Total Orders</span>
                        </div>
                        <p className="text-2xl font-bold text-zinc-900">{totalSales}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp size={14} className="text-green-500" />
                            <span className="text-xs text-zinc-500 font-medium">Revenue</span>
                        </div>
                        <p className="text-2xl font-bold text-zinc-900">{formatCurrency(revenue)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Store Link */}
            <Card className="border border-orange-100 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Link2 size={14} className="text-orange-500" />
                        <p className="font-semibold text-zinc-800 text-sm">Your Store Link</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 border border-zinc-200 rounded-lg px-3 py-2">
                        <span className="flex-1 text-xs text-zinc-600 font-mono truncate">{storeLink}</span>
                        <button onClick={copyLink} className="text-xs font-semibold text-orange-500 hover:text-orange-600 shrink-0">Copy</button>
                        <a href={`https://wa.me/?text=Buy%20data%20bundles%20from%20my%20store%3A%20${encodeURIComponent(storeLink)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 shrink-0">
                            <Share2 size={12} /> Share
                        </a>
                    </div>
                </CardContent>
            </Card>

            {/* ══════════════════════════════════════════
                 BUNDLE MANAGEMENT
            ══════════════════════════════════════════ */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-bold text-zinc-900">
                        My Store Bundles
                        {storeBundles.length > 0 && (
                            <span className="ml-2 text-xs font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                                {storeBundles.length}
                            </span>
                        )}
                    </h2>
                    <button onClick={handleShowAdd}
                        className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                        <Plus size={13} />
                        Add Bundles
                        <ChevronDown size={12} className={`transition-transform duration-200 ${showAddPanel ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* ── PICKER PANEL ── */}
                {showAddPanel && (
                    <Card className="mb-5 border border-orange-200 shadow-sm overflow-hidden">
                        <div className="bg-orange-50 px-4 py-3 border-b border-orange-100 flex items-center justify-between">
                            <p className="text-sm font-bold text-orange-700">Pick bundles from admin &amp; set your price</p>
                            <button onClick={() => setShowAddPanel(false)} className="text-orange-400 hover:text-orange-600">
                                <X size={16} />
                            </button>
                        </div>
                        <CardContent className="p-0">
                            {loadingAll ? (
                                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-400" size={24} /></div>
                            ) : allBundles.length === 0 ? (
                                <p className="text-xs text-zinc-400 text-center py-8">No bundles available. Ask the admin to create some.</p>
                            ) : (
                                <div className="divide-y divide-zinc-100">
                                    {Object.entries(allGrouped).map(([network, bundles]) => {
                                        const colors = NETWORK_COLORS[network] ?? { bg: 'bg-zinc-600', text: 'text-white', dot: 'bg-zinc-500', input: 'bg-zinc-500 border-zinc-300 text-white placeholder-zinc-300', ring: '' };
                                        return (
                                            <div key={network} className="p-4">
                                                {/* Network header */}
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className={`w-5 h-5 rounded-md ${colors.bg} ${colors.text} flex items-center justify-center text-[10px] font-black`}>
                                                        {network[0]}
                                                    </span>
                                                    <span className="text-sm font-bold text-zinc-700">{network}</span>
                                                </div>

                                                <div className="space-y-2">
                                                    {bundles.map(bundle => {
                                                        const added = addedBundleIds.has(bundle._id);
                                                        const isAdding = adding === bundle._id;
                                                        const priceVal = pickPrices[bundle._id] ?? '';

                                                        return (
                                                            <div key={bundle._id}
                                                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${added ? 'bg-green-50 border-green-200' : 'bg-white border-zinc-200 hover:border-orange-300'}`}>

                                                                {/* Network dot + info */}
                                                                <div className={`w-8 h-8 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center shrink-0`}>
                                                                    <Wifi size={14} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-semibold text-sm text-zinc-900 leading-tight truncate">{bundle.name}</p>
                                                                    <p className="text-xs text-zinc-400">Base: {formatCurrency(bundle.price)}</p>
                                                                </div>

                                                                {added ? (
                                                                    /* Already in store */
                                                                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2.5 py-1 rounded-full shrink-0">
                                                                        <Check size={11} /> Added
                                                                    </span>
                                                                ) : (
                                                                    /* Price input + Add button */
                                                                    <div className="flex items-center gap-2 shrink-0">
                                                                        <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1">
                                                                            <span className="text-[10px] text-zinc-400 font-medium">GH₵</span>
                                                                            <input
                                                                                type="number"
                                                                                min="0.01"
                                                                                step="0.01"
                                                                                placeholder={String(bundle.price)}
                                                                                value={priceVal}
                                                                                onChange={e => setPickPrices(prev => ({ ...prev, [bundle._id]: e.target.value }))}
                                                                                className="w-16 text-xs font-semibold text-zinc-900 bg-transparent focus:outline-none placeholder-zinc-300"
                                                                            />
                                                                        </div>
                                                                        <button
                                                                            onClick={() => addBundle(bundle)}
                                                                            disabled={isAdding}
                                                                            className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                                                                            {isAdding ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
                                                                            Add
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ── STORE BUNDLE CARDS ── */}
                {loadingStore ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-400" size={28} /></div>
                ) : Object.keys(grouped).length === 0 ? (
                    <Card className="border-dashed border-2 border-zinc-300">
                        <CardContent className="text-center py-12">
                            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Wifi size={20} className="text-orange-300" />
                            </div>
                            <p className="font-semibold text-zinc-500 text-sm">No bundles in your store yet</p>
                            <p className="text-xs text-zinc-400 mt-1">Click &quot;Add Bundles&quot; above to get started</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(grouped).map(([network, bundles]) => {
                            const colors = NETWORK_COLORS[network] ?? { bg: 'bg-zinc-700', text: 'text-white', input: 'bg-zinc-600 border-zinc-400 text-white placeholder-zinc-300', ring: '', dot: 'bg-zinc-600' };
                            return (
                                <div key={network}>
                                    {/* Network label */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-7 h-7 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center font-bold text-xs`}>
                                            {network[0]}
                                        </div>
                                        <h3 className="font-semibold text-zinc-700 text-sm">{network}</h3>
                                        <span className="text-xs text-zinc-400">({bundles.length})</span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {bundles.map(sb => {
                                            const displayPrice = sb.customPrice ?? sb.bundle?.price;
                                            const hasCustom = sb.customPrice !== undefined && sb.customPrice !== null;
                                            const isEditing = editingPrice === sb._id;
                                            const isSaving = savingPrice === sb._id;

                                            return (
                                                <div key={sb._id}
                                                    className={`relative rounded-2xl p-4 ${colors.bg} ${colors.text} shadow-sm group flex flex-col gap-1.5`}>

                                                    {/* Delete button */}
                                                    <button
                                                        onClick={() => removeBundle(sb._id)}
                                                        disabled={removing === sb._id || isEditing}
                                                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-black/40 transition-all z-10">
                                                        {removing === sb._id
                                                            ? <Loader2 size={10} className="animate-spin text-white" />
                                                            : <Trash2 size={10} className="text-white" />}
                                                    </button>

                                                    <Wifi size={16} className="opacity-70" />
                                                    <p className="font-extrabold text-base leading-tight">{sb.bundle?.name}</p>

                                                    {/* ── Price display / edit ── */}
                                                    {isEditing ? (
                                                        <div className="mt-1 space-y-1.5">
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs font-bold opacity-70">GH₵</span>
                                                                <input
                                                                    type="number" min="0.01" step="0.01"
                                                                    value={priceInput}
                                                                    onChange={e => setPriceInput(e.target.value)}
                                                                    onKeyDown={e => {
                                                                        if (e.key === 'Enter') savePrice(sb._id);
                                                                        if (e.key === 'Escape') cancelEditPrice();
                                                                    }}
                                                                    autoFocus
                                                                    className={`w-full rounded-lg px-2 py-1 text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-white/50 ${colors.input}`}
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <button onClick={() => savePrice(sb._id)} disabled={isSaving}
                                                                    className="flex-1 flex items-center justify-center gap-1 bg-white/25 hover:bg-white/40 rounded-lg py-1 text-xs font-bold transition-colors">
                                                                    {isSaving ? <Loader2 size={10} className="animate-spin" /> : <><Check size={10} /> Save</>}
                                                                </button>
                                                                <button onClick={cancelEditPrice}
                                                                    className="w-7 h-7 flex items-center justify-center bg-black/20 hover:bg-black/30 rounded-lg transition-colors">
                                                                    <X size={11} />
                                                                </button>
                                                            </div>
                                                            {hasCustom && (
                                                                <button onClick={() => resetPrice(sb._id)} disabled={isSaving}
                                                                    className="w-full text-[10px] opacity-70 hover:opacity-100 underline underline-offset-2 text-left transition-opacity">
                                                                    Reset to base ({formatCurrency(sb.bundle?.price)})
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => startEditPrice(sb)}
                                                            className="flex items-center gap-1.5 mt-0.5 group/price w-fit"
                                                            title="Click to set your price">
                                                            <span className="font-bold text-sm opacity-95">
                                                                {formatCurrency(displayPrice)}
                                                            </span>
                                                            {hasCustom && (
                                                                <span className="text-[9px] bg-white/30 px-1.5 py-0.5 rounded-full font-bold tracking-wide">
                                                                    custom
                                                                </span>
                                                            )}
                                                            <Pencil size={10} className="opacity-0 group-hover/price:opacity-70 transition-opacity" />
                                                        </button>
                                                    )}

                                                    {/* Strikethrough base price when custom */}
                                                    {hasCustom && !isEditing && (
                                                        <p className="text-[10px] opacity-50 line-through leading-none">
                                                            {formatCurrency(sb.bundle?.price)}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
