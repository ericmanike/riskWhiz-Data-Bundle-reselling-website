"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { ChevronRight, Loader2 } from "lucide-react";
import clsx from "clsx";
import { formatCurrency } from "@/lib/utils";
import { useSession } from "next-auth/react"




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
    { id: "MTN", name: "MTN", color: "bg-[#FFCC00]", textColor: "text-[#51291e]" },
    { id: "Telecel", name: "Telecel", color: "bg-[#E60000]", textColor: "text-white" },
    { id: "AirtelTigo", name: "AirtelTigo", color: "bg-[#003399]", textColor: "text-white" },
];

export default function BuyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const initialNetwork = searchParams.get("network");
    const initialSize = searchParams.get("size");
    const initialPrice =parseFloat( searchParams.get("price")!);
    const initialBundle = searchParams.get("bundle");
    const initialStoreBundleId = searchParams.get("storeBundleId");
       

    
   
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [bundles, setBundles] = useState<any[]>([]);
    const [loadingBundles, setLoadingBundles] = useState(false);
    const { data: session } = useSession()

    const [message, setMessage] = useState("")
  


    const loadPaystackScript = () => {
        const script = document.createElement('script')
        script.src = 'https://js.paystack.co/v1/inline.js'
        script.async = true
        document.body.appendChild(script)
    }

    // Fetch bundles when network is selected
    useEffect(() => {
       
        if (initialNetwork) {

           
            loadPaystackScript();
        }
    }, [initialNetwork]);


    const handlePurchase = async () => {


        if (phoneNumber.length < 10) {
            alert("Valid Phone number is required")
            return
        }

        const storeBundleId = searchParams.get("storeBundleId"); 
        if (!storeBundleId) {
            alert("Store bundle not found")
            return
        }
        setLoading(true);
        try {

            const reference = Date.now().toString()

            const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
            if (!paystackKey) {
                console.log('   Paystack public key not found', paystackKey)
                throw new Error('Paystack public key not found');

            }
            if (!window.PaystackPop) {
                console.log('Paystack script not loaded');
                return;
            }


            const price = initialPrice
            const tax = 0.02 * price
            let total = price + tax






            const handler = window.PaystackPop.setup({
                key: paystackKey!,
                email: session?.user?.email!|| 'guest@gmail.com',
                currency: 'GHS',
                amount: Math.round(total * 100), // Convert to kobo

                ref: reference,
                onClose: () => {

                },
                callback: function (response) {
                    (async () => {
                        try {
                            const verifyResponse = await fetch('/api/store/purchase', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    reference: reference,
                                    storeBundleId: searchParams.get("storeBundleId"),
                                    network: initialNetwork,
                                    phoneNumber: phoneNumber,
                                }),
                            });

                            if (verifyResponse.ok) {
                                console.log('Payment verified');
                                setTimeout(() => router.push('/dashboard'), 2000);
                                setMessage("Payment successful");
                            } else {
                                console.log('Payment verification failed');

                            }
                        } catch (err: any) {
                            console.error('Error verifying payment', err);
                            setMessage(err.message);
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

    const handleWalletPurchase = async () => {
        if (phoneNumber.length < 10) {
            alert("Valid Phone number is required")
            return
        }

        setLoading(true);
        try {
            const response = await fetch('/api/store/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeBundleId: searchParams.get("storeBundleId"),
                    network: initialNetwork,
                    phoneNumber: phoneNumber,
                    reference: "DATA_"+ Date.now()
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Purchase successful! Redirecting...");
                setTimeout(() => router.push('/dashboard'), 2000);
            } else {
                alert(data.message || "Wallet purchase failed");
                setMessage(data.message || "Purchase failed");
            }
        } catch (error: any) {
            console.error('Wallet purchase error:', error);
            alert("Something went wrong with the wallet purchase.");
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:max-w-[60%] mx-auto min-h-screen md:pt-35 pt-24 z-0">
            <h1 className="text-2xl font-bold mb-6">Buy Data Bundle</h1>

     


            {/* Step 3: Enter Number & Confirm */}
          
                <div className="space-y-6 w-[80%] mx-auto">

                    <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => router.back()} className="text-sm text-zinc-500 hover:text-zinc-900">
                            Back
                        </button>
                        <span className="text-zinc-300">/</span>
                        <span className="text-sm font-semibold">{initialBundle}</span>
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

                            <div className={clsx(
                                "p-4 rounded-xl space-y-2 mb-6 border border-transparent bg-blue-700 text-white"
                            )}>
                                <div className="flex justify-between text-sm">
                                    <span className="opacity-80">Network</span>
                                    <span className="font-bold">{initialNetwork}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="opacity-80">Package</span>
                                    <span className="font-bold">{initialSize}</span>
                                </div>


                                <div className="border-t border-black/10 my-2 pt-2 flex justify-between items-center">
                                    <span className="opacity-80">Transaction Fee</span>
                                    <span className="text-xl font-black">{formatCurrency(0.02 * initialPrice)}</span>
                                </div>

                                <div className="border-t border-black/10 my-2 pt-2 flex justify-between items-center">
                                    <span className="opacity-80">Total Price</span>
                                    <span className="text-xl font-black">{formatCurrency(initialPrice + 0.02 * initialPrice)}</span>
                                </div>

                            </div>
                            {message && <p className="text-center text-green-600 font-semibold">{message}</p>}

                            <div className="space-y-3">
                                <button
                                    onClick={handlePurchase}
                                    disabled={loading || phoneNumber.length < 10}
                                    className="w-full py-3.5 text-white hover:bg-blue-700 bg-blue-600 rounded-xl font-semibold transition-all flex items-center justify-center
                                     gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg
                                     cursor-pointer"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Pay with Paystack"}
                                </button>

                             
                            </div>
                        </CardContent>
                    </Card>
                </div>
         
        </div>
    );
}
