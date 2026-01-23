import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import { Card, CardContent } from "@/components/ui/Card";
import { CheckCircle2, XCircle, Clock, Wifi } from "lucide-react";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export default async function HistoryPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    await dbConnect();

    // Fetch orders for the current user
    const orders = await Order.find({ user: session.user.id })
        .sort({ createdAt: -1 })
        .limit(50); // Limit to last 50 transactions

    return (
        <div className="p-4 max-w-2xl mx-auto space-y-6 md:pt-29 pt-24 z-0">
            <h1 className="text-2xl font-bold">Transaction History</h1>

            <div className="space-y-4">
                {orders.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-slate-700">
                            <p>No transaction history found.</p>
                        </CardContent>
                    </Card>
                ) : (
                    orders.map((order) => (
                        <Card key={order._id.toString()} className="hover:border-blue-400 transition-colors">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                    ${order.network === 'MTN' ? 'bg-yellow-100 text-yellow-700' :
                                            order.network === 'Telecel' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'}`}>
                                        <Wifi size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{order.network} {order.bundleName}</h3>
                                        <p className="text-sm text-slate-950">{new Date(order.createdAt).toLocaleString()}</p>
                                        <p className="text-xs text-slate-950">{order.phoneNumber}</p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="font-bold text-white">{formatCurrency(order.price)}</p>
                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        {order.status === 'delivered' && <CheckCircle2 size={14} className="text-green-600" />}
                                        {order.status === 'failed' && <XCircle size={14} className="text-red-600" />}
                                        {order.status === 'pending' && <Clock size={14} className="text-orange-600" />}
                                        <span className={`text-xs capitalize
                      ${order.status === 'delivered' ? 'text-green-600' :
                                                order.status === 'failed' ? 'text-red-600' :
                                                    'text-orange-600'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
