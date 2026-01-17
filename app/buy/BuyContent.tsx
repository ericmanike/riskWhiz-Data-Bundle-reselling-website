"use client";




import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { ChevronRight, Loader2 } from "lucide-react";
import clsx from "clsx";
import { formatCurrency } from "@/lib/utils";
import {useSession} from "next-auth/react"





declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string
        email: string
        currency: string
        amount: number
        ref: string
        onClose: () => void
        callback: (response: { reference: string }) => void
      }) => {
        openIframe: () => void
      }
    }
  }
}
const NETWORKS = [
    { id: "MTN", name: "MTN", color: "bg-yellow-400", textColor: "text-yellow-900" },
    { id: "Telecel", name: "Telecel", color: "bg-red-500", textColor: "text-white" },
    { id: "AirtelTigo", name: "AirtelTigo", color: "bg-blue-600", textColor: "text-white" },
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
    const [bundles, setBundles] = useState<any[]>([]);
    const [loadingBundles, setLoadingBundles] = useState(false);
    const {data: session} = useSession()


  const loadPaystackScript = () => {
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    document.body.appendChild(script)
  }

    // Fetch bundles when network is selected
    useEffect(() => {
        if (selectedNetwork) {
            fetchBundles();
            loadPaystackScript();
        }
    }, [selectedNetwork]);

    const fetchBundles = async () => {
      
        setLoadingBundles(true);
        try {
            const res = await fetch('/api/bundles');
            if (res.ok) {
                const data = await res.json();
                // Filter bundles by selected network and only active ones
                const filtered = data.filter((b: any) =>
                    b.network === selectedNetwork && b.isActive
                );
                setBundles(filtered);
            }
        } catch (error) {
            console.error('Failed to fetch bundles:', error);
        } finally {
            setLoadingBundles(false);
        }
    };

    const handlePurchase = async () => {
        setLoading(true);
        try {
         


  const reference = Date.now().toString()

 const  paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
  if (!paystackKey) {
    console.log('   Paystack public key not found', paystackKey)
    throw new Error('Paystack public key not found');

  }
        if(!window.PaystackPop){
            console.log('Paystack script not loaded');
            return;
        }

        

      const handler = window.PaystackPop.setup({
        key: paystackKey!,
        email:session?.user?.email!,
        currency: 'GHS',
        amount: parseFloat(selectedBundle.price.toString()) * 100, // Convert to kobo
        
        ref: reference,
        onClose: () => {
      
        },
        callback: function (response) {
  (async () => {
    try {
      const verifyResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
             network: selectedNetwork,
                    bundleName: selectedBundle.name,
                    price: selectedBundle.price,
                    phoneNumber,
                    reference,
         }),
      });

      if (verifyResponse.ok) {
        console.log('Payment verified');
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        console.log('Payment verification failed');
      }
    } catch (err) {
      console.error('Error verifying payment', err);
    } finally {
  
    }
  })();
},

      })



      handler.openIframe()
        } catch (error) {

            console.log(error)
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

                    {loadingBundles ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                        </div>
                    ) : bundles.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-zinc-500">No bundles available for {selectedNetwork}</p>
                            <button
                                onClick={() => setStep(1)}
                                className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                Choose another network
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {bundles.map((bundle: any) => (
                                <button
                                    key={bundle._id}
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
                                    <p className="text-blue-600 font-medium">{formatCurrency(bundle.price)}</p>
                                </button>
                            ))}
                        </div>
                    )}
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
                                    <span className="text-xl font-bold text-white">{formatCurrency(selectedBundle.price)}</span>
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
