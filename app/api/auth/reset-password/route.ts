import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import PasswordReset from '@/models/PasswordReset';

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

      

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        await dbConnect();

        console.log('🔍 Looking for reset token...');
        console.log('Token (first 10 chars):', token.substring(0, 10));

        // Find the password reset record
        const resetRecord = await PasswordReset.findOne({ token }).populate('userId');

        if (!resetRecord) {
            console.log('❌ No reset record found with this token');
            console.log('   - Searched for token (first 10):', token.substring(0, 10));

            // Check if there are any reset records at all
            const allResets = await PasswordReset.find({});
            console.log('   - Total reset records in DB:', allResets.length);
            if (allResets.length > 0) {
                console.log('   - Available tokens (first 10 chars):', allResets.map(r => r.token.substring(0, 10)));
            }

            return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
        }

        console.log('✅ Reset record found!');
        console.log('   - Record ID:', resetRecord._id);
        console.log('   - User ID:', resetRecord.userId);
        console.log('   - Token matches:', resetRecord.token === token);
        console.log('   - Expires at:', resetRecord.expiresAt);
        console.log('   - Is expired:', new Date() > resetRecord.expiresAt);

        // Get the user
        const user = await User.findById(resetRecord.userId).select('+password');

        if (!user) {
            console.log('❌ User not found for ID:', resetRecord.userId);
            return NextResponse.json({ error: 'User not found' }, { status: 400 });
        }

        console.log('✅ User found:', user.email);

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('🔒 Password hashed');

        // Update password
        user.password = hashedPassword;
        await user.save();
        console.log('💾 User password updated');

        // Delete the reset record
        await PasswordReset.deleteOne({ _id: resetRecord._id });
        console.log('🗑️ Reset token deleted');

        console.log('✅ Password reset completed successfully for:', user.email);

        return NextResponse.json({ message: 'Password reset successful' });
    } catch (error: any) {
        console.error('❌ Reset password error:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        return NextResponse.json({
            error: 'Failed to reset password',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
