import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { DollarSign, CreditCard, ChevronRight, Wifi, CheckCircle2, XCircle, Clock, Handshake } from "lucide-react";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import User from "@/models/User";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import BecomeAgent from '@/components/ui/becomeAgent'
import TopUpwallet from '@/components/ui/topUpwallet'


export default async function DashboardPage() {

    const session = await getServerSession(authOptions);



    if (!session) {
        redirect("/auth/login");
    }



    await dbConnect();
    const recentOrders = await Order.find({ user: session.user.id })
        .sort({ createdAt: -1 })
        .limit(3);

    const balance = await User.findById(session.user.id).select("walletBalance");

    return (
        <div className="p-4 space-y-6 max-w-4xl mx-auto md:pt-28 pt-24 z-0">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Hello, {session?.user?.name?.split(" ")[0]} 👋</h1>
                    <p className="text-zinc-500">Welcome back</p>
                </div>
                {session?.user?.role !== 'admin' && (

                    <div className=" flex items-center gap-5">
                        <strong>Balance {formatCurrency(balance?.walletBalance || 0)}</strong>
                        <TopUpwallet />

                    </div>
                )}
            </div>

            {/* Quick Actions / Shortcuts */}
            <div>
                <h3 className="text-lg font-bold mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/buy?network=MTN">
                        <Card className="hover:border-yellow-700  hover:shadow-md cursor-pointer transition-all">
                            <CardContent className="flex items-center gap-3 p-4">
                                <div className="w-10 h-10 rounded-full bg-yellow-500 text-brown-500 flex items-center justify-center font-bold">M</div>
                                <div>
                                    <p className="font-semibold text-sm">MTN</p>
                                    <p className="text-xs text-slate-950">Buy Data</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/buy?network=Telecel">
                        <Card className="hover:border-red-600  hover:shadow-md cursor-pointer transition-all">
                            <CardContent className="flex items-center gap-3 p-4">
                                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">T</div>
                                <div>
                                    <p className="font-semibold text-sm">Telecel</p>
                                    <p className="text-xs text-slate-950">Buy Data</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/buy?network=AT">
                        <Card className="hover:border-blue-700  hover:shadow-md cursor-pointer transition-all">
                            <CardContent className="flex items-center gap-3 p-4">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">A</div>
                                <div>
                                    <p className="font-semibold text-sm">AT</p>
                                    <p className="text-xs text-slate-950">Buy Data</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Card className=" hover:shadow-md cursor-pointer transition-all">
                        <CardContent className="flex  items-center gap-3 p-4">


                            <div className="grid grid-cols-1  gap-2 w-full">
                                <Link href="/afa-registration" className="w-full">
                                    <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-brown-500 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all">
                                        AFA Registration
                                    </button>
                                </Link>


                            </div>
                        </CardContent>
                    </Card>

                </div>
                <div className='mt-5'> <BecomeAgent /></div>

            </div>

            {/* Recent Orders */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold">Orders History</h3>
                    <Link href="/history" className="text-blue-600 text-sm font-medium flex items-center">
                        View All <ChevronRight size={16} />
                    </Link>
                </div>
                <Card>
                    <CardContent className="divide-y divide-zinc-100 dark:divide-zinc-800 p-0">
                        {recentOrders.length === 0 ? (
                            <div className="p-8 text-center text-slate-950">
                                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CreditCard size={20} className="text-white" />
                                </div>
                                <p className="text-sm">No recent orders</p>
                            </div>
                        ) : (
                            recentOrders.map((order) => (
                                <div key={order._id.toString()} className="flex items-center justify-between p-4 bg-transparent border-b border-blue-500 last:border-0 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                                            ${order.network === 'MTN' ? 'bg-yellow-500 text-brown-500' :
                                                order.network === 'Telecel' ? 'bg-red-500 text-white' :
                                                    'bg-blue-600 text-white'}`}>
                                            <Wifi size={18} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-zinc-900">{order.network} {order.bundleName}</p>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-900/60">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-slate-900/40 font-medium">
                                                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-black  text-sm">{formatCurrency(order.price)}</p>
                                        <div className="flex items-center justify-end gap-1 mt-0.5">

                                            {order.status === 'delivered' && <CheckCircle2 size={12} className="text-green-500" />}
                                            {order.status === 'failed' && <XCircle size={12} className="text-red-500" />}
                                            {order.status === 'pending' && <Clock size={12} className="text-orange-500" />}
                                            <span className={`text-[10px] uppercase font-bold
                                                ${order.status === 'delivered' ? 'text-green-600' :
                                                    order.status === 'failed' ? 'text-red-500' :
                                                        'text-orange-600'}`}>
                                                {order.status === 'delivered' ? 'Delivered' : order.status}

                                            </span>

                                        </div>
                                        <span className="text-xs text-slate-950"> <strong>Order ID:</strong> {order.transaction_id}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
