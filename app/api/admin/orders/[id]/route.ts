import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import User from '@/models/User';
import Stores from '@/models/Stores';



export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await dbConnect();

        const order = await Order.findByIdAndDelete(id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { status } = await req.json();

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        await dbConnect();

        // Fetch old order to check status change
        const oldOrder = await Order.findById(id);
        if (!oldOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Check for transition to 'delivered' for store-attributed orders
        const isNowDelivered = (status.toLowerCase() === 'delivered');
        const wasAlreadyDelivered = (oldOrder.status.toLowerCase() === 'delivered');

        if (isNowDelivered && !wasAlreadyDelivered && order.agent) {
            try {
                const profit = Math.max(0, (order.price || 0) - (order.originalPrice || order.price));
                
                await Promise.all([
                    // Credit the agent's wallet
                    User.findByIdAndUpdate(order.agent, { $inc: { walletBalance: profit } }),
                    // Update store stats
                    Stores.findOneAndUpdate(
                        { agent: order.agent }, 
                        { $inc: { totalProfit: profit, totalSales: 1 } },
                        { upsert: true }
                    )
                ]);
                console.log(`💰 Credited agent ${order.agent} with profit: ${profit}`);
            } catch (err) {
                console.error("Failed to credit agent profit:", err);
            }
        }

        return NextResponse.json({ message: 'Order updated successfully', order });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
